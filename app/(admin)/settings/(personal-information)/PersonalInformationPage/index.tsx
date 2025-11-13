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

// Commented out for future use
// const countries = [
//   {
//     title: "Indonesia",
//     value: "indonesia",
//   },
//   {
//     title: "Ukraine",
//     value: "ukraine",
//   },
//   {
//     title: "USA",
//     value: "usa",
//   },
// ];

// const provincies = [
//   {
//     title: "Central Java",
//     value: "central-java",
//   },
//   {
//     title: "VIC",
//     value: "vic",
//   },
// ];

// const cities = [
//   {
//     title: "Semarang",
//     value: "semarang",
//   },
//   {
//     title: "New-York",
//     value: "new-york",
//   },
//   {
//     title: "Oslo",
//     value: "oslo",
//   },
// ];

const PersonalInformationPage = () => {
  const { emailVerified, kycCompleted, user, refreshUser } = useDashboard();

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
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
      if (user.dateOfBirth) {
        setDateOfBirth(new Date(user.dateOfBirth));
      }
    }
  }, [user]);

  const handleSave = useCallback(async () => {
    if (!user) return;

    const token = TokenManager.getToken();
    if (!token) {
      setSaveError("You must be logged in to update your profile");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const updateData: UpdateUserRequest = {
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
        date_of_birth: dateOfBirth
          ? dateOfBirth.toISOString().split("T")[0]
          : undefined,
      };

      const response = await AuthService.updateUser(updateData, token);

      if (response && "error" in response) {
        const message = Array.isArray(response.message)
          ? response.message[0]
          : response.message;
        throw new Error(message || "Failed to update profile");
      }

      // Refresh user data
      await refreshUser();

      setSaveSuccess(true);
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setSaveError(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsSaving(false);
    }
  }, [user, firstName, lastName, dateOfBirth, refreshUser]);

  const handleCancel = useCallback(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      if (user.dateOfBirth) {
        setDateOfBirth(new Date(user.dateOfBirth));
      } else {
        setDateOfBirth(null);
      }
    }
    setIsEditing(false);
    setSaveError(null);
    setSaveSuccess(false);
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
              href="mailto:hello@koajo.com"
              className="underline hover:text-blue-300 transition-colors"
            >
              hello@koajo.com
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
        />

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
          <a href="mailto:hello@koajo.com">
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
