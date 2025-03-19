import StaffDashboard from "../../components/Dashboard/StaffDashboard";
import StaffLayout from "../../components/Layout/StaffLayout";

const DashboardStaff = () => {
  return (
    <StaffLayout>
      <section className="space-y-4 p-2 sm:space-y-6 sm:p-4">
        <h1 className="text-lg font-bold sm:text-xl md:text-2xl">
          <StaffDashboard />
        </h1>
      </section>
    </StaffLayout>
  );
};

export default DashboardStaff;
