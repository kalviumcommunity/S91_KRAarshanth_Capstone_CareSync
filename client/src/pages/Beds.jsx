import CrudPage from './CrudPage';

export default function Beds() {
  return (
    <CrudPage
      title="Beds"
      endpoint="beds"
      fields={[
        ['bedNumber', 'Bed number', 'text'],
        ['department', 'Department', 'text'],
        ['type', 'Type', 'text'],
        ['status', 'Status', 'select', ['Available', 'Occupied', 'Cleaning', 'Maintenance'], 'Available'],
      ]}
    />
  );
}
