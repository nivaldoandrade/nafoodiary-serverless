import { Goal } from '@application/entities/Goal';
import { Profile } from '@application/entities/Profile';

export class GoalCalculator {

  static calculate(profile: Profile): Goal {
    const tdee = this.calculateMaintenanceCalories(profile);
    const adjustmentRatio = GoalCalculator.GOAL_CALORIE_ADJUSTMENT_RATIO[profile.goal];
    const minimumCalories = GoalCalculator.MINIMUM_CALORIES[profile.gender];

    const calories = Math.max(
      minimumCalories,
      Math.round(tdee * (1 + adjustmentRatio)),
    );

    const proteins = Math.round(this.calculateProteins(profile));
    const fats = Math.round(this.calculateFats(profile, calories));
    const carbohydrates = Math.max(
      0,
      Math.round(
        (calories - this.getCaloriesFromProteinsAndFats(proteins, fats))
        / GoalCalculator.CALORIES_PER_CARBOHYDRATE,
      ),
    );

    return new Goal({
      accountId: profile.accountId,
      calories,
      proteins,
      carbohydrates,
      fats,
    });
  }

  private static calculateMaintenanceCalories(profile: Profile): number {
    const age = this.calculateAge(profile.birthDate);
    const bmr = profile.gender === Profile.Gender.MALE
      ? this.calculateMaleBmr(profile, age)
      : this.calculateFemaleBmr(profile, age);

    const activityMultiplier = GoalCalculator.ACTIVITY_MULTIPLIER[profile.activityLevel];

    return bmr * activityMultiplier;
  }

  private static calculateMaleBmr(profile: Profile, age: number): number {
    return (10 * profile.weight) + (6.25 * profile.height) - (5 * age) + 5;
  }

  private static calculateFemaleBmr(profile: Profile, age: number): number {
    return (10 * profile.weight) + (6.25 * profile.height) - (5 * age) - 161;
  }

  private static calculateProteins(profile: Profile): number {
    const ratio = GoalCalculator.PROTEIN_PER_WEIGHT[profile.goal];
    return profile.weight * ratio;
  }

  private static calculateFats(profile: Profile, calories: number): number {
    const ratio = GoalCalculator.FAT_CALORIE_RATIO[profile.goal];
    return (calories * ratio) / GoalCalculator.CALORIES_PER_FAT;
  }

  private static getCaloriesFromProteinsAndFats(proteins: number, fats: number): number {
    return (proteins * GoalCalculator.CALORIES_PER_PROTEIN)
      + (fats * GoalCalculator.CALORIES_PER_FAT);
  }

  private static calculateAge(birthDate: Date): number {
    const now = new Date();
    let age = now.getFullYear() - birthDate.getFullYear();
    const monthDiff = now.getMonth() - birthDate.getMonth();
    const dayDiff = now.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age -= 1;
    }

    return age;
  }
}

export namespace GoalCalculator {
  export type Result = {
    calories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
  }

  export const CALORIES_PER_PROTEIN = 4;
  export const CALORIES_PER_CARBOHYDRATE = 4;
  export const CALORIES_PER_FAT = 9;

  export const MINIMUM_CALORIES: Record<Profile.Gender, number> = {
    [Profile.Gender.MALE]: 1500,
    [Profile.Gender.FEMALE]: 1200,
  } as const;

  export const ACTIVITY_MULTIPLIER: Record<Profile.ActivityLevel, number> = {
    [Profile.ActivityLevel.SENDENTARY]: 1.2,
    [Profile.ActivityLevel.LIGHT]: 1.375,
    [Profile.ActivityLevel.MODERATE]: 1.55,
    [Profile.ActivityLevel.HEAVY]: 1.725,
    [Profile.ActivityLevel.ATHELETE]: 1.9,
  } as const;

  export const GOAL_CALORIE_ADJUSTMENT_RATIO: Record<Profile.Goal, number> = {
    [Profile.Goal.LOSE]: -0.20,
    [Profile.Goal.MAINTAIN]: 0,
    [Profile.Goal.GAIN]: 0.10,
  } as const;

  export const PROTEIN_PER_WEIGHT: Record<Profile.Goal, number> = {
    [Profile.Goal.LOSE]: 2.4,
    [Profile.Goal.MAINTAIN]: 1.8,
    [Profile.Goal.GAIN]: 2.0,
  } as const;

  export const FAT_CALORIE_RATIO: Record<Profile.Goal, number> = {
    [Profile.Goal.LOSE]: 0.25,
    [Profile.Goal.MAINTAIN]: 0.30,
    [Profile.Goal.GAIN]: 0.25,
  } as const;
}
