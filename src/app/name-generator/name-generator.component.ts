import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TabsModule } from 'primeng/tabs';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';

import { NameRegion, RACE_PANEL, RacePanel, TreeNode as AppTreeNode } from './name-generator.model';
import { NameGeneratorService } from './name-generator.service';

@Component({
  selector: 'app-name-generator',
  imports: [FormsModule, ReactiveFormsModule, ButtonModule, RadioButtonModule, TreeModule, CheckboxModule, ProgressSpinnerModule, TabsModule],
  templateUrl: './name-generator.component.html',
  styleUrl: './name-generator.component.scss',
})
export class NameGeneratorComponent {
  public activeTabValue: string = RACE_PANEL[0].title;
  public racePanels: RacePanel[] = RACE_PANEL;
  public treeNodes: TreeNode[] = [];
  public selectedTreeNode: TreeNode | null = null;
  public selectedRegionValue: string | null = null;

  public isNoble: FormControl = new FormControl(false);
  public genderControl = new FormControl('all', Validators.required);
  public names: string[] = [];
  public isLoading: boolean = false;
  public hasNotNoble: boolean = false;
  public selectedRegionLabel: string | null = null;
  public resultContext: { tab: string; region: string; gender: string; noble: boolean; hasNotNoble: boolean } | null = null;

  private region: NameRegion;

  constructor(private nameService: NameGeneratorService) {
    const savedTab = localStorage.getItem('openPanelIndex');
    if (savedTab !== null) {
      // legacy: numeric index stored as string
      const asNumber = parseInt(savedTab, 10);
      this.activeTabValue = isNaN(asNumber) ? savedTab : (RACE_PANEL[asNumber]?.title ?? RACE_PANEL[0].title);
    }
    this._buildTreeNodes(this.activeTabValue);
  }

  private _buildTreeNodes(tabTitle: string): void {
    const panel = this.racePanels.find((p) => p.title === tabTitle);
    const treeData = panel?.treeData ?? [];
    this.treeNodes = this._toTreeNodes(treeData);
  }

  private _toTreeNodes(nodes: AppTreeNode[]): TreeNode[] {
    return nodes.map((n) => ({
      label: n.name,
      data: n.region,
      leaf: !n.children || n.children.length === 0,
      children: n.children ? this._toTreeNodes(n.children) : undefined,
    }));
  }

  public onTabChange(value: string | number): void {
    this.activeTabValue = String(value);
    localStorage.setItem('openPanelIndex', this.activeTabValue);
    this._buildTreeNodes(this.activeTabValue);
    this.selectedTreeNode = null;
    this.selectedRegionValue = null;
    this.setRegion(null, false);
  }

  public onTreeNodeSelect(event: { node: TreeNode }): void {
    if (event.node.leaf && event.node.data) {
      this.setRegion(event.node.data, true);
    }
  }

  public isFormValid(): boolean {
    return this.genderControl.valid && !!this.region;
  }

  public setRegion(region: any, isTree: boolean): void {
    this.hasNotNoble = isTree ? !this.hasNoble(region?.value) : !region?.hasNoble;
    this.region = region?.value;
    this.selectedRegionLabel = region?.label ?? null;
  }

  public getGenderLabel(gender: string): string {
    const map: Record<string, string> = { male: 'männlich', female: 'weiblich', all: 'alle' };
    return map[gender] ?? gender;
  }

  public async getNames(): Promise<void> {
    this.isLoading = true;
    this.resultContext = {
      tab: this.activeTabValue,
      region: this.selectedRegionLabel ?? '',
      gender: this.genderControl.value ?? 'all',
      noble: !!this.isNoble.value,
      hasNotNoble: this.hasNotNoble,
    };
    try {
      this.names = await this.nameService.getNameList(this.region, this.genderControl.value, this.isNoble.value);
    } catch (error) {
      console.error('Error loading names:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private hasNoble(regionValue: NameRegion): boolean | null {
    for (const race of RACE_PANEL) {
      for (const regionCategory of race.treeData) {
        for (const region of regionCategory.children) {
          if (region.region && region.region.value === regionValue) {
            return region.region.hasNoble;
          }
        }
      }
    }
    return null; //no region found
  }
}
