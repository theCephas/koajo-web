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

const breadcrumbs = [
  {
    title: "Settings",
    url: "/settings",
  },
  {
    title: "Personal Information",
  },
];

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
  const [name, setName] = useState<string>("Rainer Yeger");
  const [email, setEmail] = useState<string>("yourname@gmail.com");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [country, setCountry] = useState<string>(countries[0].value);
  const [province, setProvince] = useState<string>(provincies[0].value);
  const [city, setCity] = useState<string>(cities[0].value);

  const handleChangeCountry = (value: string) => setCountry(value);
  const handleChangeProvince = (value: string) => setProvince(value);
  const handleChangeCity = (value: string) => setCity(value);

  return (
    <Layout title="Settings" breadcrumbs={breadcrumbs}>
      <Settings title="Personal Information" tooltip="Small description">
        <PhotoProfile />
        <Field
          className={styles.field}
          label="Display name"
          placeholder="Type display name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          required
        />
        <Field
          className={styles.field}
          label="Email"
          placeholder="Type email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <DatePicker
          className={styles.field}
          label="Date of Birth"
          selected={startDate}
          onChange={(date) => date && setStartDate(date)}
          dateFormat="MM - dd - yyyy"
          icon
        />
        <div className={styles.row}>
          <Select
            className={styles.select}
            label="Country"
            value={country}
            onChange={handleChangeCountry}
            options={countries}
            dropdownUp
          />
          <Select
            className={styles.select}
            label="Province"
            value={province}
            onChange={handleChangeProvince}
            options={provincies}
            dropdownUp
          />
          <Select
            className={styles.select}
            label="City"
            value={city}
            onChange={handleChangeCity}
            options={cities}
            dropdownUp
          />
        </div>
        <div className={styles.btns}>
          <button className={cn("button-stroke", styles.button)}>Cancel</button>
          <button className={cn("button", styles.button)}>Yes</button>
        </div>
      </Settings>
    </Layout>
  );
};

export default PersonalInformationPage;
