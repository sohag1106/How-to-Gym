"use client";

import { EquipmentFormDialog } from "@/components/equipment/equipment-form-dialog";
import { createEquipmentTemplate } from "./actions";

type Option = { id: string; name?: string; label?: string };

export function CreateTemplateDialog({
  groups,
  patterns,
}: {
  groups: Option[];
  patterns: Option[];
}) {
  return (
    <EquipmentFormDialog
      groups={groups}
      patterns={patterns}
      action={createEquipmentTemplate}
      triggerLabel="Add equipment"
      dialogTitle="Add equipment to catalog"
      submitLabel="Add to catalog"
    />
  );
}
