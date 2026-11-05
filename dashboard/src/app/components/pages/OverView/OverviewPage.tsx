import Chart from "./Chart";
import RecentUsersSection from "./RecentUsersSection";
import Stats from "./Stats";

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <Stats />
      <Chart />
      <RecentUsersSection/>
    </div>
  );
}
