import { Injectable } from "@angular/core";
import { EXPERIENCE_LEVELS } from "../constants/experience-levels.const";
import { ExperienceLevel } from "../models/experience-level.model";

@Injectable({ providedIn: 'root' })
export class ExperienceLevelService {
  getExperienceLevels(): ExperienceLevel[] {
    return EXPERIENCE_LEVELS;
  }
}
