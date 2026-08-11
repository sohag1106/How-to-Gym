export function equipmentImageUrl(id: string): string {
  return `/api/images/equipment/${id}`;
}

export function templateImageUrl(id: string): string {
  return `/api/images/template/${id}`;
}

export function exerciseDemoUrls(id: string): { start: string; end: string } {
  return {
    start: `/api/images/demo-start/${id}`,
    end: `/api/images/demo-end/${id}`,
  };
}
