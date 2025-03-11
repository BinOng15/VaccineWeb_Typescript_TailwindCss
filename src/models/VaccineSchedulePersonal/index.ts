export interface VaccineSchedulePersonalResponseDTO {
  vaccineSchedulePersonalId: number;
  vaccineScheduleId: number;
  childId: number;
  diseaseId: number;
  vaccineId: number;
  doseNumber: number;
  scheduledDate: string;
  isCompleted: number;
  isActive: number;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
}
