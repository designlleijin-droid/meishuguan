/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum HallType {
  ANIMAL = 'animal',
  PLANT = 'plant',
  ARTIFACT = 'artifact',
  BUILDING = 'building',
  GENERAL = 'general'
}

export interface Sticker {
  id: string;
  nameZh: string;
  nameEn: string;
  hallType: HallType;
  imageUrl: string;
  originalImageUrl: string;
  fact: string;
  capturedAt: number;
  interactionType?: 'sound' | 'action' | 'detail';
}

export interface Hall {
  id: HallType;
  titleZh: string;
  titleEn: string;
  color: string;
  icon: string;
}

export type AppState = 'HOME' | 'CAMERA' | 'PROCESSING' | 'RESULT' | 'MUSEUM' | 'HALL_DETAIL';
