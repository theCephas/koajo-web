import styles from "./DashboardV2Page.module.sass";
import Layout from "@/components2/usefull/Layout";
import Navigation from "@/components2/usefull/Navigation";
import PodInfo from "@/components/admin/pod-info";  
import PodGoals from "@/components/admin/pod-goals";
import PodMembers from "@/components/admin/pod-members";
import Achievements from "@/components/admin/achievements";
import PocketPlans from "@/components2/usefull/PocketPlans";
import RecentActivity from "@/components2/usefull/RecentActivity";
import Currency from "@/components2/usefull/Currency";
import ExpenseCategory from "@/components2/usefull/ExpenseCategory";
import BalanceInfo from "@/components/admin/blance-info";
import ExpenseAnalysis from "@/components2/usefull/ExpenseAnalysis";
import CycleDuration from "@/components/admin/cycle-duration";


import { plans } from "@/mocks/plans";
import { activity } from "@/mocks/activity";
import { currency } from "@/mocks/currency";
import { expenseCategory } from "@/mocks/expenseCategory";
import { incomeAnalysis } from "@/mocks/incomeAnalysis";
import { expenseAnalysis } from "@/mocks/expenseAnalysis";

const Dashboard = () => {
  return (
    <Layout
      title="Welcome back, Rainer Yaeger 👏🏻"
      // breadcrumbs={breadcrumbs}
      head={<Navigation />}
    >
      <div className={styles.row}>
        <div className={styles.col}>
          <PodInfo />
          <RecentActivity viewItems={5} items={activity} />
        </div>
        <div className={styles.col}>
          <BalanceInfo />
          <CycleDuration />
          <PodGoals />
        </div>
        <div className={styles.col}>
          <PodMembers />
          <Achievements />
          <div className={styles.card}>
            {/* <PocketPlans items={plans} />  */}
          </div>
          <div className={styles.card}>
            {/* <Currency items={currency} /> */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

const breadcrumbs = [
  {
    title: "Dashboard",
    url: "/",
  },
  {
    title: "Overview",
  },
];
