import AdminLayout from "../../components/Layout/AdminLayout";
import DashboardAdmin from "./DashboardAdmin";

const AdminPage = () => {
  return (
    <>
      <AdminLayout>
        <section className="space-y-4 p-2 sm:space-y-6 sm:p-4">
          <h1 className="text-lg font-bold sm:text-xl md:text-2xl">
            Admin Dashboard
          </h1>
          <DashboardAdmin />
        </section>
      </AdminLayout>
    </>
  );
};

export default AdminPage;
