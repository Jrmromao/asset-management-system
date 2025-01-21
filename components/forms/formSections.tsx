interface FormField {
  name: string;
  form: any;
  label: string;
  data: any[];
  onNew: () => void; // Changed to required
  placeholder: string;
  required: boolean;
  isPending?: boolean;
}

export interface CommonProps {
  form: any;
  locations: DepartmentLocation[];
  departments: Department[];
  inventories: Inventory[];
  openLocation: () => void;
  openDepartment: () => void;
  openInventory: () => void;
  isLoading: boolean;
}

export function getLocationSection(props: CommonProps): FormField[] {
  const {
    form,
    locations,
    departments,
    inventories,
    openLocation,
    openDepartment,
    openInventory,
  } = props;

  return [
    {
      name: "locationId",
      form,
      label: "Location",
      data: locations,
      onNew: openLocation,
      placeholder: "Select location",
      required: true,
    },
    {
      name: "departmentId",
      form,
      label: "Department",
      data: departments,
      onNew: openDepartment,
      placeholder: "Select department",
      required: true,
    },
    {
      name: "inventoryId",
      form,
      label: "Inventory",
      data: inventories,
      onNew: openInventory,
      placeholder: "Select inventory",
      required: true,
    },
  ];
}

export function getStatusLocationSection(
  props: CommonProps & {
    statusLabels: StatusLabel[];
    openStatus: () => void;
  },
): FormField[] {
  const { form, statusLabels, openStatus, isLoading } = props;

  return [
    {
      name: "statusLabelId",
      form,
      isPending: isLoading,
      label: "Status",
      data: statusLabels,
      onNew: openStatus,
      placeholder: "Select status",
      required: true,
    },
    ...getLocationSection(props),
  ];
}

export function getStatusLocationLicenseSection(
  props: CommonProps,
): FormField[] {
  return getLocationSection(props);
}
