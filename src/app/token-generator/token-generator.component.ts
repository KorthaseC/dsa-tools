import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';

/** Ratio of the inner coin circle radius to half the canvas width (0..1).
 *  Calibrated against Coin.png – the transparent inner hole spans ~72 % of the half-width. */
const INNER_CIRCLE_RATIO = 0.72;

/** Fixed logical canvas size in pixels (both width and height). */
const CANVAS_SIZE = 400;

@Component({
  selector: 'app-token-generator',
  imports: [CommonModule, FormsModule, ButtonModule, FileUploadModule, InputTextModule],
  templateUrl: './token-generator.component.html',
  styleUrl: './token-generator.component.scss',
})
export class TokenGeneratorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileUpload') private fileUploadRef!: FileUpload;

  public imageLoaded = false;
  public downloadUrl: string | null = null;
  public downloadFileName = 'token';
  public isEditingFileName = false;

  private img: HTMLImageElement | null = null;
  private coinImg: HTMLImageElement | null = null;

  // Current pan offset (canvas-space coordinates of the image top-left corner)
  private offsetX = 0;
  private offsetY = 0;
  // Current zoom scale factor
  private scale = 1;

  // Pointer drag state
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragOffsetStartX = 0;
  private dragOffsetStartY = 0;

  // Pinch-zoom state
  private lastPinchDistance = 0;

  // Bound event handlers (kept for removeEventListener)
  private boundPointerDown!: (e: PointerEvent) => void;
  private boundPointerMove!: (e: PointerEvent) => void;
  private boundPointerUp!: (e: PointerEvent) => void;
  private boundWheel!: (e: WheelEvent) => void;
  private boundTouchStart!: (e: TouchEvent) => void;
  private boundTouchMove!: (e: TouchEvent) => void;
  private boundTouchEnd!: (e: TouchEvent) => void;

  constructor(
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.preloadCoinImage();
  }

  ngOnDestroy(): void {
    this.detachCanvasListeners();
  }

  // ── Public event handlers ────────────────────────────────────────────────

  public onFileSelected(event: { files: File[] }): void {
    const file = event.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      return;
    }
    this.downloadFileName = file.name.replace(/\.[^/.]+$/, '') + '_token';

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const image = new Image();
      image.onload = () => {
        // FileReader / Image callbacks run outside Angular's zone.
        // ngZone.run() re-enters the zone so state changes trigger CD.
        this.ngZone.run(() => {
          this.img = image;
          this.fitImageToCircle();
          const wasLoaded = this.imageLoaded;
          this.imageLoaded = true;
          this.downloadUrl = null;
          // Synchronously process the @if so the canvas element exists in DOM.
          this.cdr.detectChanges();
          if (!wasLoaded) {
            this.attachCanvasListeners();
          }
          this.draw();
        });
      };
      image.src = src;
    };
    reader.readAsDataURL(file);
  }

  public generateToken(): void {
    if (!this.img) {
      return;
    }
    const canvas = this.canvasRef.nativeElement;
    this.draw(true);
    this.downloadUrl = canvas.toDataURL('image/png');
    this.isEditingFileName = false;
    // Restore the editor view after capturing
    requestAnimationFrame(() => this.draw(false));
  }

  public confirmFileName(): void {
    this.downloadFileName = this.downloadFileName.trim() || 'token';
    this.isEditingFileName = false;
  }

  public changeImage(): void {
    this.imageLoaded = false;
    this.downloadUrl = null;
    this.img = null;
    this.detachCanvasListeners();
  }

  public chooseFile(): void {
    this.fileUploadRef?.choose();
  }

  // ── Canvas drawing ───────────────────────────────────────────────────────

  private draw(exportMode = false): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;
    const innerRadius = cx * INNER_CIRCLE_RATIO;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (this.img) {
      if (exportMode) {
        // Clip to the inner circle for the final export
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
        ctx.clip();
      }

      ctx.drawImage(this.img, this.offsetX, this.offsetY, this.img.naturalWidth * this.scale, this.img.naturalHeight * this.scale);

      if (exportMode) {
        ctx.restore();
      }
    }

    // Overlay the coin
    if (this.coinImg) {
      if (!exportMode) {
        ctx.globalAlpha = 0.85;
      }
      ctx.drawImage(this.coinImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.globalAlpha = 1.0;
    }
  }

  // ── Pointer / drag logic ─────────────────────────────────────────────────

  private onPointerDown(e: PointerEvent): void {
    if (e.pointerType === 'touch') {
      return; // handled by touchstart
    }
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.dragOffsetStartX = this.offsetX;
    this.dragOffsetStartY = this.offsetY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.isDragging || e.pointerType === 'touch') {
      return;
    }
    const ratio = this.getCssToLogicalRatio();
    this.offsetX = this.dragOffsetStartX + (e.clientX - this.dragStartX) * ratio;
    this.offsetY = this.dragOffsetStartY + (e.clientY - this.dragStartY) * ratio;
    this.draw();
  }

  private onPointerUp(e: PointerEvent): void {
    if (e.pointerType !== 'touch') {
      this.isDragging = false;
    }
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    const ratio = this.getCssToLogicalRatio();
    const canvasRect = this.canvasRef.nativeElement.getBoundingClientRect();

    // Canvas-space coordinates of the mouse pointer
    const mouseX = (e.clientX - canvasRect.left) * ratio;
    const mouseY = (e.clientY - canvasRect.top) * ratio;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.max(0.05, Math.min(20, this.scale * zoomFactor));

    // Zoom towards the mouse cursor
    this.offsetX = mouseX - (mouseX - this.offsetX) * (newScale / this.scale);
    this.offsetY = mouseY - (mouseY - this.offsetY) * (newScale / this.scale);
    this.scale = newScale;

    this.draw();
  }

  // ── Touch / pinch logic ──────────────────────────────────────────────────

  private onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    if (e.touches.length === 1) {
      this.isDragging = true;
      this.dragStartX = e.touches[0].clientX;
      this.dragStartY = e.touches[0].clientY;
      this.dragOffsetStartX = this.offsetX;
      this.dragOffsetStartY = this.offsetY;
    } else if (e.touches.length === 2) {
      this.isDragging = false;
      this.lastPinchDistance = this.pinchDistance(e);
    }
  }

  private onTouchMove(e: TouchEvent): void {
    e.preventDefault();
    const ratio = this.getCssToLogicalRatio();

    if (e.touches.length === 1 && this.isDragging) {
      this.offsetX = this.dragOffsetStartX + (e.touches[0].clientX - this.dragStartX) * ratio;
      this.offsetY = this.dragOffsetStartY + (e.touches[0].clientY - this.dragStartY) * ratio;
      this.draw();
    } else if (e.touches.length === 2) {
      const currentDist = this.pinchDistance(e);
      if (this.lastPinchDistance === 0) {
        this.lastPinchDistance = currentDist;
        return;
      }

      const zoomFactor = currentDist / this.lastPinchDistance;
      const newScale = Math.max(0.05, Math.min(20, this.scale * zoomFactor));

      // Zoom towards the midpoint of the two touches
      const canvasRect = this.canvasRef.nativeElement.getBoundingClientRect();
      const midX = ((e.touches[0].clientX + e.touches[1].clientX) / 2 - canvasRect.left) * ratio;
      const midY = ((e.touches[0].clientY + e.touches[1].clientY) / 2 - canvasRect.top) * ratio;

      this.offsetX = midX - (midX - this.offsetX) * (newScale / this.scale);
      this.offsetY = midY - (midY - this.offsetY) * (newScale / this.scale);
      this.scale = newScale;

      this.lastPinchDistance = currentDist;
      this.draw();
    }
  }

  private onTouchEnd(e: TouchEvent): void {
    if (e.touches.length < 2) {
      this.lastPinchDistance = 0;
    }
    if (e.touches.length === 0) {
      this.isDragging = false;
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private fitImageToCircle(): void {
    if (!this.img) {
      return;
    }
    const innerRadius = (CANVAS_SIZE / 2) * INNER_CIRCLE_RATIO;
    const diameter = innerRadius * 2;
    const { naturalWidth: w, naturalHeight: h } = this.img;

    // Object-cover: scale so the shorter dimension fills the inner circle diameter
    this.scale = Math.max(diameter / w, diameter / h);

    // Centre the image
    this.offsetX = (CANVAS_SIZE - w * this.scale) / 2;
    this.offsetY = (CANVAS_SIZE - h * this.scale) / 2;
  }

  /** Returns the ratio of logical canvas pixels to CSS pixels on screen. */
  private getCssToLogicalRatio(): number {
    const cssWidth = this.canvasRef.nativeElement.getBoundingClientRect().width;
    return CANVAS_SIZE / cssWidth;
  }

  private pinchDistance(e: TouchEvent): number {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private preloadCoinImage(): void {
    const coin = new Image();
    coin.onload = () => {
      this.coinImg = coin;
      if (this.img) {
        this.draw();
      }
    };
    coin.src = 'assets/other/Coin.png';
  }

  private attachCanvasListeners(): void {
    const canvas = this.canvasRef.nativeElement;

    this.boundPointerDown = (e) => this.ngZone.run(() => this.onPointerDown(e));
    this.boundPointerMove = (e) => this.ngZone.run(() => this.onPointerMove(e));
    this.boundPointerUp = (e) => this.ngZone.run(() => this.onPointerUp(e));
    this.boundWheel = (e) => this.ngZone.run(() => this.onWheel(e));
    this.boundTouchStart = (e) => this.ngZone.run(() => this.onTouchStart(e));
    this.boundTouchMove = (e) => this.ngZone.run(() => this.onTouchMove(e));
    this.boundTouchEnd = (e) => this.ngZone.run(() => this.onTouchEnd(e));

    // Run outside Angular to avoid triggering change detection on every frame
    this.ngZone.runOutsideAngular(() => {
      canvas.addEventListener('pointerdown', this.boundPointerDown);
      canvas.addEventListener('pointermove', this.boundPointerMove);
      canvas.addEventListener('pointerup', this.boundPointerUp);
      canvas.addEventListener('wheel', this.boundWheel, { passive: false });
      canvas.addEventListener('touchstart', this.boundTouchStart, { passive: false });
      canvas.addEventListener('touchmove', this.boundTouchMove, { passive: false });
      canvas.addEventListener('touchend', this.boundTouchEnd);
    });
  }

  private detachCanvasListeners(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) {
      return;
    }
    canvas.removeEventListener('pointerdown', this.boundPointerDown);
    canvas.removeEventListener('pointermove', this.boundPointerMove);
    canvas.removeEventListener('pointerup', this.boundPointerUp);
    canvas.removeEventListener('wheel', this.boundWheel);
    canvas.removeEventListener('touchstart', this.boundTouchStart);
    canvas.removeEventListener('touchmove', this.boundTouchMove);
    canvas.removeEventListener('touchend', this.boundTouchEnd);
  }
}
