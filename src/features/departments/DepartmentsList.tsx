import { PageContainer } from '../../components/layout/PageContainer';

const DepartmentsList = () => {
  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage hospital departments
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <p className="text-gray-500">Department management features coming soon...</p>
      </div>
    </PageContainer>
  );
};

export default DepartmentsList;