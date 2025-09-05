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

import { captions, transactions } from "@/mocks/transactions";

const breadcrumbs = [
  {
    title: "Dashboard",
    url: "/",
  },
  {
    title: "Transaction",
  },
];

type TransactionPageProps = {};

const TransactionPage = ({}: TransactionPageProps) => {
  const [search, setSearch] = useState<string>("");
  const [visibleFilters, setVisibleFilters] = useState<boolean>(false);
  const [choose, setChoose] = useState<boolean>(false);
  const [selectedFilters, setSelectedFilters] = useState<Array<string>>([]);

  const handleChange = (filter: any) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((x: any) => x !== filter));
    } else {
      setSelectedFilters((selectedFilters: any) => [
        ...selectedFilters,
        filter,
      ]);
    }
  };

  const handleClick = () => {
    setChoose(!choose);
    if (choose) {
      setSelectedFilters([]);
    } else {
      setSelectedFilters(transactions.map((x: any) => x.id));
    }
  };

  return (
    <Layout
      title="Welcome back, Rainer Yaeger 👏🏻"
      breadcrumbs={breadcrumbs}
      head={<Navigation />}
    >
      <div className={styles.transaction}>
        <Head
          search={search}
          setSearch={(e: any) => setSearch(e.target.value)}
          onSubmit={() => console.log("Submit")}
          onFilter={() => setVisibleFilters(!visibleFilters)}
          visible={visibleFilters}
        />
        {visibleFilters && <Filters />}
        <div className={styles.inner}>
          <div className={styles.table}>
            <div className={styles.head}>
              <div className={styles.cell}>
                <div className="flex justify-center w-12">
                  <Checkbox
                    className={styles.checkbox}
                    value={choose}
                    onChange={handleClick}
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
                  value={selectedFilters.includes(transaction.id)}
                  onChange={() => handleChange(transaction.id)}
                  item={transaction}
                  key={transaction.id}
                />
              ))}
            </div>
          </div>
        </div>
        <Foot />
      </div>
    </Layout>
  );
};

export default TransactionPage;
