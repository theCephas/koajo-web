"use client";
import { useState, useCallback, useEffect } from "react";
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
import { Button, Badge } from "@/components/utils";
import { AuthService } from "@/lib/services/authService";
import { TokenManager } from "@/lib/utils/memory-manager";
import type { UpdateUserRequest } from "@/lib/types/api";

const PersonalInformationPage = () => {
  const { emailVerified, kycCompleted, user, refreshUser } = useDashboard();

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Commented out for future use
  // const [country, setCountry] = useState<string>(countries[0].value);
  // const [province, setProvince] = useState<string>(provincies[0].value);
  // const [city, setCity] = useState<string>(cities[0].value);

  // const handleChangeCountry = (value: string) => setCountry(value);
  // const handleChangeProvince = (value: string) => setProvince(value);
  // const handleChangeCity = (value: string) => setCity(value);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setBankName(user.bankAccount?.bank_name || "");
    }
  }, [user]);

  return (
    <Layout
      title="Settings"
      breadcrumbs={DASHBOARD_BREADCRUMBS.PERSONAL_INFORMATION}
    >
      <Settings
        title="Personal Information"
        tooltip="View your personal information"
      >
        <PhotoProfile />

        <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <p className="text-sm text-orange-400">
            <strong>Note:</strong> Profile information cannot be edited
            directly. To update your personal details, please contact our
            support team at{" "}
            <a
              href="mailto:support@koajo.com"
              className="underline hover:text-blue-300 transition-colors"
            >
              support@koajo.com
            </a>
          </p>
        </div>

        {saveSuccess && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-400">
              Profile updated successfully!
            </p>
          </div>
        )}

        {saveError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{saveError}</p>
          </div>
        )}

        <Field
          className={styles.field}
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={true}
          placeholder="Enter your first name"
        />

        <Field
          className={styles.field}
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          disabled={true}
          placeholder="Enter your last name"
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

        <Field
          className={styles.field}
          label="Bank Name"
          value={lastName}
          onChange={(e) => setBankName(e.target.value)}
          disabled={true}
          // placeholder="Enter your last name"
        />

        {/* <Field
          type="date"
          className={styles.field}
          label="Date of Birth"
          value={dateOfBirth ? dateOfBirth.toISOString().split("T")[0] : ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value) {
              setDateOfBirth(new Date(value));
            } else {
              setDateOfBirth(null);
            }
          }}
          disabled={true}
          placeholder="YYYY-MM-DD"
        /> */}

        {/* Commented out for future use */}
        {/* <div className={styles.row}>
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
        </div> */}

        <div className={styles.btns}>
          <a href="mailto:support@koajo.com">
            <Button
              variant="primary"
              showArrow={false}
              text="Contact Support to Edit"
            />
          </a>
        </div>
      </Settings>
    </Layout>
  );
};

export default PersonalInformationPage;
