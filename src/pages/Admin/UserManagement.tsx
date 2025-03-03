import AdminLayout from "../../components/Layout/AdminLayout";
import UserComponent from "../../components/Users/User";

const UserManagement = () => {
  return (
    <div>
      <AdminLayout>
        <UserComponent />
      </AdminLayout>
    </div>
  );
};

export default UserManagement;
