"use client";
import { useState } from "react";
import styles from "./TransactionPage.module.sass";
import Layout from "@/components2/usefull/Layout";
import Navigation from "@/components2/usefull/Navigation";
import Checkbox from "@/components2/Checkbox";
import Icon from "@/components2/usefull/Icon";
import Filters from "./Filters";
import Head from "./Head";
import Transaction from "./Transaction";
import Foot from "./Foot";
import BalanceInfo from "@/components/admin/blance-info";
import PodMembers from "@/components/admin/pod-members";
import CycleDuration from "@/components/admin/cycle-duration";
import { captions, transactions } from "@/mocks/transactions";
import { CheckboxValue, TransactionType } from "@/types";
import { DASHBOARD_BREADCRUMBS } from "@/lib/constants/dashboard";
import { useDashboard } from "@/lib/provider-dashboard";
import cn from "clsx";

const TransactionPage = () => {
  const { emailVerified, kycCompleted } = useDashboard();
  const isLocked = !emailVerified || !kycCompleted;

  const [search, setSearch] = useState<string>("");
  const [visibleFilters, setVisibleFilters] = useState<boolean>(false);
  const [choose, setChoose] = useState<CheckboxValue>("unchecked");
  const [selectedFilters, setSelectedFilters] = useState<
    Array<TransactionType>
  >([]);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<
    Array<string>
  >([]);

  const handleChange = (transaction: TransactionType) => {
    setSelectedTransactionIds([...selectedTransactionIds, transaction.id]);
    if (selectedTransactionIds.includes(transaction.id)) {
      setSelectedTransactionIds(
        selectedTransactionIds.filter((id) => id !== transaction.id)
      );
    }
  };

  const handleChangeCheckbox = (checked: boolean) => {
    if (checked) {
      setSelectedTransactionIds([...selectedTransactionIds]);
    } else {
      setSelectedTransactionIds([]);
    }
  };

  return (
    <Layout
      title="Welcome 👏🏻"
      breadcrumbs={DASHBOARD_BREADCRUMBS.POD_INFO_AND_TRANSACTIONS}
      head={<Navigation />}
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="col-span-1">
            <BalanceInfo inforType="contribution" />
          </div>
          <div className="col-span-2">
            <PodMembers />
          </div>
          <div className="col-span-1">
            <CycleDuration />
          </div>
        </div>

        {/* <div className={styles.transaction}>
          <Head
            search={search}
            setSearch={(e) => setSearch(e.target.value)}
            onSubmit={() => console.log("Submit")}
            onFilter={() => setVisibleFilters(!visibleFilters)}
            visible={visibleFilters}
          />
          {visibleFilters && <Filters />}
          <div
            className={cn(
              styles.inner,
              isLocked &&
                "[&>div]:blur-sm [&>div]:select-none [&>div]:pointer-events-none"
            )}
          >
            <div className={styles.table}>
              <div className={styles.head}>
                <div className={styles.cell}>
                  <div className="flex justify-center w-12">
                    <Checkbox
                      className={styles.checkbox}
                      value={choose}
                      onChange={(e) => handleChangeCheckbox(e.target.checked)}
                    />
                  </div>
                </div>
                <div className="flex grow justify-between items-center gap-4">
                  {captions.map((caption) => (
                    <div className={styles.cell} key={caption.id}>
                      {caption.title}
                      {caption.sorting && (
                        <button className={styles.sorting}>
                          <Icon name="arrow-swap" size="18" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.body}>
                {transactions.map((transaction) => (
                  <Transaction
                    checkboxValue={
                      selectedTransactionIds.includes(transaction.id)
                        ? "checked"
                        : "unchecked"
                    }
                    onChange={() => handleChange(transaction)}
                    item={transaction}
                    key={transaction.id}
                  />
                ))}
              </div>
            </div>
          </div>
          <Foot />
        </div> */}
      </div>
    </Layout>
  );
};

export default TransactionPage;
