"use client";
import { useState } from "react";
import cn from "clsx";
import styles from "./PersonalInformationPage.module.sass";
import Layout from "@/components2/usefull/Layout";
import Settings from "@/components2/Settings";
import Field from "@/components2/usefull/Field";
import DatePicker from "@/components2/usefull/DatePicker";
import Select from "@/components2/usefull/Select";
import PhotoProfile from "./PhotoProfile";
import { DASHBOARD_BREADCRUMBS } from "@/lib/constants/dashboard";
import { useDashboard } from "@/lib/provider-dashboard";
import DatePickerField from "@/components2/usefull/DatePickerField";
import {Button, Badge } from "@/components/utils"


const countries = [
  {
    title: "Indonesia",
    value: "indonesia",
  },
  {
    title: "Ukraine",
    value: "ukraine",
  },
  {
    title: "USA",
    value: "usa",
  },
];

const provincies = [
  {
    title: "Central Java",
    value: "central-java",
  },
  {
    title: "VIC",
    value: "vic",
  },
];

const cities = [
  {
    title: "Semarang",
    value: "semarang",
  },
  {
    title: "New-York",
    value: "new-york",
  },
  {
    title: "Oslo",
    value: "oslo",
  },
];

const PersonalInformationPage = () => {
  const { emailVerified, kycCompleted, user } = useDashboard();
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [country, setCountry] = useState<string>(countries[0].value);
  const [province, setProvince] = useState<string>(provincies[0].value);
  const [city, setCity] = useState<string>(cities[0].value);

  const handleChangeCountry = (value: string) => setCountry(value);
  const handleChangeProvince = (value: string) => setProvince(value);
  const handleChangeCity = (value: string) => setCity(value);

  return (
    <Layout title="Settings" breadcrumbs={DASHBOARD_BREADCRUMBS.PERSONAL_INFORMATION}>
      <Settings title="Personal Information" tooltip="Small description">
        <PhotoProfile />
        <Field
          className={styles.field}
          label="Full Name"
          value={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()}
          onChange={(e) => {}}
          disabled
        />
        <Field
          className={styles.field}
          label="Email"
          placeholder="Type email"
          type="email"
          value={user?.email ?? ""}
          onChange={(e) => {}}
          required
          disabled
          componentPosition="suffix"
          component={
            <Badge variant={emailVerified ? "positive" : "negative"}>
              {emailVerified ? "Verified" : "Unverified"}
            </Badge>
          }
        />
        <DatePickerField
          className={styles.field}
          label="Date of Birth"
          selected={startDate}
          onChange={(date) => date && setStartDate(date)}
          dateFormat="MM - dd - yyyy"
          icon
          disabled
        />
        <div className={styles.row}>
          <Select
            className={styles.select}
            label="Country"
            value={country}
            onChange={handleChangeCountry}
            options={countries}
            dropdownUp
            disabled
          />
          <Select
            className={styles.select}
            label="Province"
            value={province}
            onChange={handleChangeProvince}
            options={provincies}
            dropdownUp
            disabled
          />
          <Select
            className={styles.select}
            label="City"
            value={city}
            onChange={handleChangeCity}
            options={cities}
            dropdownUp
            disabled
          />
        </div>
        <div className={styles.btns}>
          <Button variant="secondary" showArrow={false} text={"Request Change"}/>
        </div>
      </Settings>
    </Layout>
  );
};

export default PersonalInformationPage;
