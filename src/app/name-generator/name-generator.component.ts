import { FlatTreeControl } from '@angular/cdk/tree';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeModule,
} from '@angular/material/tree';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  NameRegion,
  RACE_PANEL,
  RacePanel,
  TreeNode,
} from './name-generator.model';
import { NameGeneratorService } from './name-generator.service';

interface FlatNode {
  expandable: boolean;
  name: string;
  value: NameRegion;
  level: number;
}

@Component({
  selector: 'app-name-generator',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    CommonModule,
    TranslateModule,
    MatRadioModule,
    MatTreeModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatAutocompleteModule,
    AsyncPipe,
  ],
  templateUrl: './name-generator.component.html',
  styleUrl: './name-generator.component.scss',
})
export class NameGeneratorComponent {
  public openPanelIndex: number = -1;
  public racePanels: RacePanel[] = RACE_PANEL;

  public _transformer = (node: TreeNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      value: node?.region?.value,
      level: level,
    };
  };

  public treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  public treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );

  public dataSource = new MatTreeFlatDataSource(
    this.treeControl,
    this.treeFlattener
  );

  public isNoble: FormControl = new FormControl(false);
  public genderControl = new FormControl('all', Validators.required);
  public names: string[] = [];
  public isLoading: boolean = false;
  public hasNotNoble: boolean = false;

  private region: NameRegion;

  constructor(
    private translateService: TranslateService,
    private nameService: NameGeneratorService
  ) {
    this.dataSource.data = this.racePanels[0].treeData;

    //check local storage for tab and open it
    const savedTabIndex = localStorage.getItem('openPanelIndex');
    if (savedTabIndex !== null) {
      this.openPanelIndex = parseInt(savedTabIndex, 10);
    }
  }

  public setRace(index: number) {
    this.openPanelIndex = this.openPanelIndex === index ? -1 : index;

    //save tab in local storage
    if (this.openPanelIndex > -1) {
      localStorage.setItem('openPanelIndex', this.openPanelIndex.toString());
    } else {
      localStorage.removeItem('openPanelIndex');
    }

    if (
      this.openPanelIndex > -1 &&
      this.racePanels[this.openPanelIndex].treeData
    ) {
      this.dataSource.data = this.racePanels[this.openPanelIndex].treeData;
    }
    this.setRegion(null, false);
  }

  public hasChild = (_: number, node: FlatNode) => node.expandable;

  public isFormValid(): boolean {
    return this.genderControl.valid && !!this.region;
  }

  public setRegion(region: any, isTree: boolean): void {
    this.hasNotNoble = isTree
      ? !this.hasNoble(region?.value)
      : !region?.hasNoble;
    this.region = region?.value;
  }

  public async getNames(): Promise<void> {
    this.isLoading = true;
    try {
      this.names = await this.nameService.getNameList(
        this.region,
        this.genderControl.value,
        this.isNoble.value
      );
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
