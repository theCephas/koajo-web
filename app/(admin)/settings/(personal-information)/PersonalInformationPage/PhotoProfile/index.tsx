"use client";
import { useState, useEffect } from "react";
import cn from "clsx";
import Image from "@/components2/usefull/Image";
import Icon from "@/components2/usefull/Icon";
import Modal from "@/components/utils/modal";
import { AuthService } from "@/lib/services/authService";
import { TokenManager } from "@/lib/utils/memory-manager";
import { useDashboard } from "@/lib/provider-dashboard";
import { getAvatarUrl, getDefaultAvatarUrl } from "@/lib/utils/avatar";
import type { Avatar } from "@/lib/types/api";
import { Button } from "@/components/utils";
import { Trash2 } from "lucide-react";

const GENDER_FILTERS: { label: string; value: "all" | "male" | "female" }[] = [
  { label: "All", value: "all" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

const PhotoProfile = () => {
  const { user, refreshUser } = useDashboard();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [filteredAvatars, setFilteredAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(
    user?.avatarId || null
  );
  const [previewAvatarId, setPreviewAvatarId] = useState<string | null>(
    user?.avatarId || null
  );
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">(
    "all"
  );
  const [error, setError] = useState<string | null>(null);

  // Fetch available avatars
  useEffect(() => {
    const fetchAvatars = async () => {
      const response = await AuthService.getAvatars();
      if (response && "error" in response) {
        console.error("Failed to fetch avatars:", response.error);
        return;
      }
      setAvatars(response as Avatar[]);
      setFilteredAvatars(response as Avatar[]);
    };

    fetchAvatars();
  }, []);

  // Update selected avatar when user changes
  useEffect(() => {
    const currentAvatar = user?.avatarId || null;
    setSelectedAvatarId(currentAvatar);
    setPreviewAvatarId(currentAvatar);
  }, [user]);

  useEffect(() => {
    if (showSelector) {
      setPreviewAvatarId(selectedAvatarId);
    }
  }, [showSelector, selectedAvatarId]);

  // Filter avatars by gender
  useEffect(() => {
    if (genderFilter === "all") {
      setFilteredAvatars(avatars);
    } else {
      setFilteredAvatars(avatars.filter((a) => a.gender === genderFilter));
    }
  }, [genderFilter, avatars]);

  const handleSelectAvatar = async (avatarId: string) => {
    const token = TokenManager.getToken();
    if (!token) {
      setError("You must be logged in to update your avatar");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await AuthService.updateAvatar(
        { avatarUrl: avatarId },
        token
      );

      if (response && "error" in response) {
        const message = Array.isArray(response.message)
          ? response.message[0]
          : response.message;
        throw new Error(message || "Failed to update avatar");
      }

      setSelectedAvatarId(avatarId);
      setShowSelector(false);

      // Refresh user data
      await refreshUser();
    } catch (err) {
      console.error("Failed to update avatar:", err);
      setError(err instanceof Error ? err.message : "Failed to update avatar");
    } finally {
      setLoading(false);
    }
  };

  const hasPendingSelection =
    previewAvatarId !== null && previewAvatarId !== selectedAvatarId;

  const handleConfirmSelection = async () => {
    if (!previewAvatarId) {
      setShowSelector(false);
      return;
    }

    if (!hasPendingSelection) {
      setShowSelector(false);
      return;
    }

    await handleSelectAvatar(previewAvatarId);
  };

  const currentAvatarUrl = selectedAvatarId
    ? getAvatarUrl(selectedAvatarId)
    : getDefaultAvatarUrl();

  return (
    <div className="mb-8">
      <div className="mb-3.5 text-xs leading-[1.6] font-medium text-[#9A9FA5]">
        Photo Profile
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex justify-center items-center shrink-0 w-20 h-20 rounded-full overflow-hidden bg-[#EFEFEF]">
          {selectedAvatarId ? (
            <Image
              src={currentAvatarUrl}
              fill
              style={{ objectFit: "cover" }}
              alt="Avatar"
            />
          ) : (
            <Icon name="user" size="32" />
          )}
        </div>

        <Button
          onClick={() => setShowSelector(true)}
          disabled={loading}
          text={loading ? "Updating..." : "Choose Avatar"}
        />
      </div>

      <Modal
        visible={showSelector}
        onClose={() => setShowSelector(false)}
        position={{ vertical: "center", horizontal: "center" }}
      >
        <div className="bg-white rounded-2xl md:rounded-[28px] shadow-2xl w-[min(95vw,960px)] max-h-[80vh] md:max-h-[85vh] mx-auto flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 border-b border-slate-100 shrink-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg lg:text-2xl font-semibold text-slate-900 truncate">
                  Avatars
                </h3>
              </div>
              <p className="mt-1 text-xs md:text-sm text-slate-500 line-clamp-2">
                Choose the avatar that best represents you across the app.
              </p>
            </div>
            <button
              onClick={() => setShowSelector(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1.5 md:p-2 hover:bg-slate-100 shrink-0 ml-2"
              aria-label="Close avatar picker"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-col flex-1 overflow-hidden min-h-0">
            <div className="px-4 md:px-6 pt-4 md:pt-5 pb-3 md:pb-4 border-b border-slate-100 shrink-0">
              <p className="text-[10px] md:text-[11px] uppercase tracking-[0.15em] md:tracking-[0.2em] text-slate-400 mb-2 md:mb-3">
                Filter
              </p>
              <div className="flex flex-wrap gap-2">
                {GENDER_FILTERS.map(({ label, value }) => {
                  const isActive = genderFilter === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setGenderFilter(value)}
                      className={cn(
                        "px-3 md:px-4 lg:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary text-white shadow-lg shadow-primary/25"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 md:py-6 custom-scrollbar overscroll-contain">
              {filteredAvatars.length > 0 ? (
                <div className="mx-auto w-full max-w-3xl grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5 lg:gap-6 place-items-center pb-2">
                  {filteredAvatars.map((avatar) => {
                    const isActive = previewAvatarId === avatar.id;
                    const isApplied = selectedAvatarId === avatar.id;

                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setPreviewAvatarId(avatar.id)}
                        disabled={loading}
                        className={cn(
                          "group flex flex-col items-center gap-1.5 md:gap-2 text-xs sm:text-sm font-medium text-slate-500 transition-all duration-200 focus-visible:outline-none w-full",
                          loading && "opacity-60 cursor-not-allowed"
                        )}
                        aria-pressed={isActive}
                        title={avatar.altText}
                      >
                        <div
                          className={cn(
                            "relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-linear-to-br from-white to-slate-50 ring-1 ring-white/70",
                            isActive &&
                              "bg-linear-to-br from-orange-50 via-white to-white ring-2 md:ring-4 ring-primary/40"
                          )}
                        >
                          <div className="relative w-14 h-14 sm:w-[72px] sm:h-[72px] md:w-[84px] md:h-[84px] rounded-full overflow-hidden bg-white">
                            <Image
                              src={getAvatarUrl(
                                avatar.id,
                                "w_300,h_300,c_fill,g_face"
                              )}
                              fill
                              style={{ objectFit: "cover" }}
                              alt={avatar.altText}
                            />
                          </div>
                          {isActive && (
                            <span className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 inline-flex h-5 w-5 md:h-7 md:w-7 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                              <svg
                                className="w-3 h-3 md:w-4 md:h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </span>
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-[9px] md:text-[11px] uppercase tracking-wide",
                            isActive || isApplied
                              ? "text-primary"
                              : "text-slate-400"
                          )}
                        >
                          {isApplied ? "Current" : "Select"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-6 md:py-8 text-xs md:text-sm">
                  {avatars.length === 0
                    ? "Loading avatars..."
                    : "No avatars found for this filter"}
                </p>
              )}
            </div>

            <div className="px-4 md:px-6 py-4 md:py-5 border-t border-slate-100 flex flex-col gap-2 md:gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
              <button
                type="button"
                onClick={() => setShowSelector(false)}
                disabled={loading}
                className="w-full sm:w-auto rounded-full border border-slate-200 px-5 md:px-6 py-2.5 md:py-3 text-xs md:text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSelection}
                disabled={loading || !hasPendingSelection}
                className="w-full sm:w-auto rounded-full bg-primary px-6 md:px-8 py-2.5 md:py-3 text-xs md:text-sm font-semibold text-white shadow-[0_10px_25px_rgba(253,139,81,0.30)] md:shadow-[0_14px_30px_rgba(253,139,81,0.35)] transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Select"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PhotoProfile;
