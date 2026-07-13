"use client";

import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { ContentCard } from "@/components/shared/ContentCard";
import { FormField } from "@/components/shared/FormField";
import { PageShell } from "@/components/shared/PageShell";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  apiRequest,
  clearAuth,
  getValidAuthToken,
  getStoredUser,
} from "@/lib/api";

type ProfileFormData = {
  name: string;
  username: string;
  age: string;
  gender: string;
  preferred_travel_gender: string;
  bio: string;
  profile_picture_url: string;
  travel_style: string;
  preferred_destinations: string;
  budget_range: string;
  preferred_trip_duration: string;
  available_from: string;
  available_to: string;
  interests: string;
  languages_spoken: string;
  country: string;
  city: string;
  previously_visited_countries: string;
  linkedin: string;
  instagram: string;
  personal_website: string;
};

type TravelProfile = Omit<
  ProfileFormData,
  | "age"
  | "preferred_destinations"
  | "interests"
  | "languages_spoken"
  | "previously_visited_countries"
> & {
  user_id?: string;
  age: number | null;
  preferred_destinations?: string[] | null;
  interests?: string[] | null;
  languages_spoken?: string[] | null;
  previously_visited_countries?: string[] | null;
};

type ProfileResponse = {
  profile_created: boolean;
  profile: TravelProfile | null;
};

type ProfileSaveResponse = {
  message: string;
  profile: TravelProfile;
};

const PROFILE_SAVE_SUCCESS_MESSAGE = "✅ Travel Profile Updated Successfully!";
const SUCCESS_VISIBLE_DURATION_MS = 3000;
const SUCCESS_CLEAR_DURATION_MS = 3400;

type ProfileCompleteness = {
  complete: boolean;
  missing_fields: string[];
};

type ProfileEnumField =
  | "gender"
  | "preferred_travel_gender"
  | "travel_style"
  | "budget_range"
  | "preferred_trip_duration";

type ProfileEnumOptions = Partial<Record<ProfileEnumField, string[]>>;

type ProfileOptionsResponse = {
  enum_options: ProfileEnumOptions;
  required_ai_matching_fields: string[];
};

type IncompleteProfileDetail = {
  code?: string;
  message?: string;
  profile_completeness?: ProfileCompleteness;
};

type ProfileFieldErrors = Partial<Record<keyof ProfileFormData, string>>;

type ProfileField = {
  label: string;
  name: keyof ProfileFormData;
  type?: string;
  options?: string[];
};

const incompleteProfileCode = "profile_incomplete";

const matchingFieldLabels: Record<string, string> = {
  name: "Name",
  username: "Username",
  age: "Age",
  gender: "Gender",
  preferred_travel_gender: "Preferred gender to travel with",
  bio: "Bio",
  country: "Country",
  city: "City",
  travel_style: "Default travel style",
  preferred_destinations: "Preferred destinations",
  budget_range: "Default budget",
  preferred_trip_duration: "Preferred trip duration",
  available_from: "Available from",
  available_to: "Available to",
  interests: "Favourite interests",
  languages_spoken: "Languages spoken",
};

const enumFieldNames = new Set<keyof ProfileFormData>([
  "gender",
  "preferred_travel_gender",
  "travel_style",
  "budget_range",
  "preferred_trip_duration",
]);

const interestTagCategories = {
  Adventure: [
    "Backpacking",
    "Hiking",
    "Trekking",
    "Camping",
    "Road Trips",
    "Solo Travel",
    "Group Travel",
    "Offbeat Destinations",
    "Wildlife Safaris",
    "Scuba Diving",
  ],
  Nature: [
    "Beaches",
    "Mountains",
    "National Parks",
    "Forests",
    "Deserts",
    "Lakes",
    "Waterfalls",
    "Stargazing",
    "Eco Travel",
    "Photography",
  ],
  "Food And Culture": [
    "Local Food",
    "Street Food",
    "Fine Dining",
    "Coffee Culture",
    "Wine Tasting",
    "Museums",
    "Historical Sites",
    "Architecture",
    "Festivals",
    "Cultural Immersion",
  ],
  Lifestyle: [
    "Luxury Travel",
    "Budget Travel",
    "Wellness Retreats",
    "Yoga",
    "Spa Experiences",
    "Shopping",
    "Nightlife",
    "Digital Nomad Travel",
    "Slow Travel",
    "Volunteer Travel",
  ],
  "Sports And Activities": [
    "Skiing",
    "Snowboarding",
    "Surfing",
    "Cycling",
    "Kayaking",
    "Rafting",
    "Rock Climbing",
    "Running",
    "Golf",
    "Sailing",
  ],
  "Travel Preferences": [
    "Family Travel",
    "Couples Travel",
    "Pet-Friendly Travel",
    "Train Journeys",
    "Cruises",
    "Island Hopping",
    "Weekend Getaways",
    "Workations",
    "Hidden Gems",
    "UNESCO Sites",
  ],
} as const;

const emptyProfile: ProfileFormData = {
  name: "",
  username: "",
  age: "",
  gender: "",
  preferred_travel_gender: "",
  bio: "",
  profile_picture_url: "",
  travel_style: "",
  preferred_destinations: "",
  budget_range: "",
  preferred_trip_duration: "",
  available_from: "",
  available_to: "",
  interests: "",
  languages_spoken: "",
  country: "",
  city: "",
  previously_visited_countries: "",
  linkedin: "",
  instagram: "",
  personal_website: "",
};

const profileFieldNames = new Set<keyof ProfileFormData>(
  Object.keys(emptyProfile) as (keyof ProfileFormData)[],
);

const sections: {
  title: string;
  fields: ProfileField[];
  textarea?: ProfileField;
}[] = [
  {
    title: "Basic Information",
    fields: [
      { label: "Name", name: "name" },
      { label: "Username", name: "username" },
      { label: "Age", name: "age", type: "number" },
      { label: "Gender", name: "gender" },
      {
        label: "Preferred Gender to Travel With",
        name: "preferred_travel_gender",
      },
      { label: "Profile Picture URL", name: "profile_picture_url", type: "url" },
    ],
    textarea: { label: "Bio", name: "bio" },
  },
  {
    title: "Home Location",
    fields: [
      { label: "Country", name: "country" },
      { label: "City", name: "city" },
    ],
  },
  {
    title: "Languages",
    fields: [{ label: "Languages Spoken", name: "languages_spoken" }],
  },
  {
    title: "Travel History",
    fields: [
      {
        label: "Previously Visited Countries",
        name: "previously_visited_countries",
      },
    ],
  },
  {
    title: "Social Links",
    fields: [
      { label: "LinkedIn", name: "linkedin", type: "url" },
      { label: "Instagram", name: "instagram", type: "url" },
      { label: "Personal Website", name: "personal_website", type: "url" },
    ],
  },
  {
    title: "Default Travel Preferences",
    fields: [
      { label: "Default Travel Style", name: "travel_style" },
      { label: "Preferred Destinations", name: "preferred_destinations" },
      { label: "Default Budget", name: "budget_range" },
      { label: "Preferred Trip Duration", name: "preferred_trip_duration" },
      { label: "Available From", name: "available_from", type: "date" },
      { label: "Available To", name: "available_to", type: "date" },
    ],
  },
];

const listFields = new Set([
  "preferred_destinations",
  "interests",
  "languages_spoken",
  "previously_visited_countries",
]);

function decodeTokenSubject(token: string | null) {
  if (!token) {
    return "";
  }

  try {
    const payload = JSON.parse(window.atob(token.split(".")[1]));
    return typeof payload.sub === "string" ? payload.sub : "";
  } catch {
    return "";
  }
}

function fallbackProfileData(): ProfileFormData {
  const storedUser = getStoredUser();
  const email = storedUser?.email || decodeTokenSubject(getValidAuthToken());
  const emailName = email.split("@")[0] || "traveler";
  const username = emailName.replace(/[^a-z0-9._-]/gi, "").slice(0, 50);

  return {
    ...emptyProfile,
    name: storedUser?.name || emailName,
    username: storedUser?.username || (username.length >= 3 ? username : "traveler"),
  };
}

function listToFormText(values?: string[] | null) {
  return Array.isArray(values) ? values.join(", ") : "";
}

function dateToFormValue(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function canonicalizeOption(value: string | null | undefined, options?: string[]) {
  const trimmedValue = value?.trim() || "";

  if (!trimmedValue) {
    return "";
  }

  return (
    options?.find(
      (option) => option.toLowerCase() === trimmedValue.toLowerCase(),
    ) || trimmedValue
  );
}

function getEnumOptions(
  fieldName: keyof ProfileFormData,
  enumOptions?: ProfileEnumOptions | null,
) {
  return enumFieldNames.has(fieldName)
    ? enumOptions?.[fieldName as ProfileEnumField] || []
    : undefined;
}

function normalizeProfileEnumFields(
  formData: ProfileFormData,
  enumOptions?: ProfileEnumOptions | null,
) {
  return {
    ...formData,
    gender: canonicalizeOption(formData.gender, enumOptions?.gender),
    preferred_travel_gender: canonicalizeOption(
      formData.preferred_travel_gender,
      enumOptions?.preferred_travel_gender,
    ),
    travel_style: canonicalizeOption(
      formData.travel_style,
      enumOptions?.travel_style,
    ),
    budget_range: canonicalizeOption(
      formData.budget_range,
      enumOptions?.budget_range,
    ),
    preferred_trip_duration: canonicalizeOption(
      formData.preferred_trip_duration,
      enumOptions?.preferred_trip_duration,
    ),
  };
}

function profileToForm(
  profile: TravelProfile,
  enumOptions?: ProfileEnumOptions | null,
): ProfileFormData {
  return normalizeProfileEnumFields({
    name: profile.name ?? "",
    username: profile.username ?? "",
    age: profile.age ? String(profile.age) : "",
    gender: profile.gender ?? "",
    preferred_travel_gender: profile.preferred_travel_gender ?? "",
    bio: profile.bio ?? "",
    profile_picture_url: profile.profile_picture_url ?? "",
    travel_style: profile.travel_style ?? "",
    preferred_destinations: listToFormText(profile.preferred_destinations),
    budget_range: profile.budget_range ?? "",
    preferred_trip_duration: profile.preferred_trip_duration ?? "",
    available_from: dateToFormValue(profile.available_from),
    available_to: dateToFormValue(profile.available_to),
    interests: listToFormText(profile.interests),
    languages_spoken: listToFormText(profile.languages_spoken),
    country: profile.country ?? "",
    city: profile.city ?? "",
    previously_visited_countries:
      listToFormText(profile.previously_visited_countries),
    linkedin: profile.linkedin ?? "",
    instagram: profile.instagram ?? "",
    personal_website: profile.personal_website ?? "",
  }, enumOptions);
}

function toList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNullableString(value: string) {
  return value.trim() || null;
}

function formToPayload(
  formData: ProfileFormData,
  enumOptions?: ProfileEnumOptions | null,
) {
  const normalizedFormData = normalizeProfileEnumFields(formData, enumOptions);

  return {
    name: normalizedFormData.name,
    username: normalizedFormData.username,
    age: normalizedFormData.age ? Number(normalizedFormData.age) : null,
    gender: toNullableString(normalizedFormData.gender),
    preferred_travel_gender: toNullableString(
      normalizedFormData.preferred_travel_gender,
    ),
    bio: toNullableString(normalizedFormData.bio),
    profile_picture_url: toNullableString(normalizedFormData.profile_picture_url),
    travel_style: toNullableString(normalizedFormData.travel_style),
    preferred_destinations: toList(normalizedFormData.preferred_destinations),
    budget_range: toNullableString(normalizedFormData.budget_range),
    preferred_trip_duration: toNullableString(
      normalizedFormData.preferred_trip_duration,
    ),
    available_from: toNullableString(normalizedFormData.available_from),
    available_to: toNullableString(normalizedFormData.available_to),
    interests: toList(normalizedFormData.interests),
    languages_spoken: toList(normalizedFormData.languages_spoken),
    country: toNullableString(normalizedFormData.country),
    city: toNullableString(normalizedFormData.city),
    previously_visited_countries: toList(
      normalizedFormData.previously_visited_countries,
    ),
    linkedin: toNullableString(normalizedFormData.linkedin),
    instagram: toNullableString(normalizedFormData.instagram),
    personal_website: toNullableString(normalizedFormData.personal_website),
  };
}

function uniqueList(values: string[]) {
  return Array.from(new Set(values));
}

function normalizeUrl(value: string) {
  try {
    return new URL(value.trim());
  } catch {
    return null;
  }
}

function isHttpsUrl(value: string) {
  const url = normalizeUrl(value);
  return Boolean(url && url.protocol === "https:");
}

function isSupportedHost(hostname: string, allowedHost: string) {
  const normalizedHostname = hostname.toLowerCase();
  return (
    normalizedHostname === allowedHost ||
    normalizedHostname.endsWith(`.${allowedHost}`)
  );
}

function validateSupportedValue(
  value: string,
  supportedValues: string[],
  fieldLabel: string,
) {
  const trimmedValue = value.trim();

  if (
    !trimmedValue ||
    !supportedValues.length ||
    supportedValues.some(
      (supportedValue) =>
        supportedValue.toLowerCase() === trimmedValue.toLowerCase(),
    )
  ) {
    return "";
  }

  return `${fieldLabel} must be one of: ${supportedValues.join(", ")}`;
}

function isRequiredAiMatchingField(
  fieldName: keyof ProfileFormData,
  profileOptions?: ProfileOptionsResponse | null,
) {
  return Boolean(profileOptions?.required_ai_matching_fields.includes(fieldName));
}

function isMissingRequiredValue(fieldName: keyof ProfileFormData, value: string) {
  if (listFields.has(fieldName)) {
    return toList(value).length === 0;
  }

  return !value.trim();
}

function validateField(
  fieldName: keyof ProfileFormData,
  value: string,
  currentFormData: ProfileFormData,
  profileOptions?: ProfileOptionsResponse | null,
  requireMissingValue = false,
) {
  const trimmedValue = value.trim();

  if (
    requireMissingValue &&
    isRequiredAiMatchingField(fieldName, profileOptions) &&
    isMissingRequiredValue(fieldName, value)
  ) {
    return "This field is required.";
  }

  switch (fieldName) {
    case "name": {
      if (!trimmedValue) {
        return "Name is required";
      }

      if (trimmedValue.length < 2 || trimmedValue.length > 60) {
        return "Name must be 2-60 characters";
      }

      if (!/\p{L}/u.test(trimmedValue)) {
        return "Name must include at least one letter";
      }

      if (!/^[\p{L}\s'-]+$/u.test(trimmedValue)) {
        return "Name can only contain letters, spaces, apostrophes, and hyphens";
      }

      return "";
    }

    case "username": {
      const normalizedUsername = trimmedValue.toLowerCase();

      if (!normalizedUsername) {
        return "Username is required";
      }

      if (normalizedUsername.length < 3 || normalizedUsername.length > 30) {
        return "Username must be 3-30 characters";
      }

      if (!/^[a-z0-9_.]+$/.test(normalizedUsername)) {
        return "Username can only contain lowercase letters, numbers, underscores, and dots";
      }

      if (/^[._]|[._]$/.test(normalizedUsername)) {
        return "Username cannot start or end with a dot or underscore";
      }

      if (normalizedUsername.includes("..")) {
        return "Username cannot contain consecutive dots";
      }

      return "";
    }

    case "age": {
      if (!trimmedValue) {
        return "";
      }

      const age = Number(trimmedValue);

      if (!Number.isInteger(age)) {
        return "Age must be a whole number";
      }

      if (age < 18 || age > 100) {
        return "Age must be between 18 and 100";
      }

      return "";
    }

    case "gender":
      return validateSupportedValue(
        trimmedValue,
        profileOptions?.enum_options.gender || [],
        "Gender",
      );

    case "preferred_travel_gender":
      return validateSupportedValue(
        trimmedValue,
        profileOptions?.enum_options.preferred_travel_gender || [],
        "Preferred travel gender",
      );

    case "bio": {
      if (!trimmedValue) {
        return "";
      }

      if (trimmedValue.length < 20 || trimmedValue.length > 500) {
        return "Bio must be 20-500 characters";
      }

      return "";
    }

    case "profile_picture_url":
      return !trimmedValue || isHttpsUrl(trimmedValue)
        ? ""
        : "Profile picture URL must be an HTTPS URL";

    case "country":
      return "";

    case "city":
      return !trimmedValue || (trimmedValue.length >= 2 && trimmedValue.length <= 80)
        ? ""
        : "City must be 2-80 characters";

    case "languages_spoken": {
      const languages = uniqueList(toList(trimmedValue));
      return languages.length <= 10 ? "" : "Enter no more than 10 languages";
    }

    case "previously_visited_countries":
      return "";

    case "linkedin": {
      if (!trimmedValue) {
        return "";
      }

      const url = normalizeUrl(trimmedValue);

      if (!url || url.protocol !== "https:" || !isSupportedHost(url.hostname, "linkedin.com")) {
        return "LinkedIn must be a valid LinkedIn HTTPS URL";
      }

      return "";
    }

    case "instagram": {
      if (!trimmedValue) {
        return "";
      }

      if (/^@[A-Za-z0-9._]{1,30}$/.test(trimmedValue)) {
        return "";
      }

      const url = normalizeUrl(trimmedValue);

      if (!url || url.protocol !== "https:" || !isSupportedHost(url.hostname, "instagram.com")) {
        return "Instagram must be an Instagram HTTPS URL or @username";
      }

      return "";
    }

    case "personal_website":
      return !trimmedValue || isHttpsUrl(trimmedValue)
        ? ""
        : "Personal website must be an HTTPS URL";

    case "travel_style":
      return validateSupportedValue(
        trimmedValue,
        profileOptions?.enum_options.travel_style || [],
        "Travel style",
      );

    case "preferred_destinations": {
      const destinations = uniqueList(toList(trimmedValue));
      return destinations.length <= 10
        ? ""
        : "Enter no more than 10 preferred destinations";
    }

    case "budget_range":
      return validateSupportedValue(
        trimmedValue,
        profileOptions?.enum_options.budget_range || [],
        "Budget",
      );

    case "preferred_trip_duration":
      return validateSupportedValue(
        trimmedValue,
        profileOptions?.enum_options.preferred_trip_duration || [],
        "Trip duration",
      );

    case "available_from":
      if (
        trimmedValue &&
        currentFormData.available_to &&
        currentFormData.available_to < trimmedValue
      ) {
        return "Available from must be on or before available to";
      }

      return "";

    case "available_to":
      if (
        trimmedValue &&
        currentFormData.available_from &&
        trimmedValue < currentFormData.available_from
      ) {
        return "Available to cannot be before available from";
      }

      return "";

    case "interests": {
      const interests = uniqueList(toList(trimmedValue));
      const allInterestTags = new Set<string>(
        Object.values(interestTagCategories).flat(),
      );
      const invalidInterests = interests.filter(
        (interest) => !allInterestTags.has(interest),
      );

      if (interests.length > 0 && interests.length < 3) {
        return "Choose at least 3 interests";
      }

      if (interests.length > 15) {
        return "Choose no more than 15 interests";
      }

      if (invalidInterests.length) {
        return `Invalid interest tags: ${invalidInterests.join(", ")}`;
      }

      return "";
    }

    default:
      return "";
  }
}

function withoutEmptyErrors(errors: ProfileFieldErrors) {
  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message),
  ) as ProfileFieldErrors;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanBackendValidationMessage(message: string) {
  return message.replace(/^Value error,\s*/i, "");
}

function getProfileFieldFromLocation(location: string[]) {
  for (let index = location.length - 1; index >= 0; index -= 1) {
    const fieldName = location[index] as keyof ProfileFormData;

    if (profileFieldNames.has(fieldName)) {
      return fieldName;
    }
  }

  return undefined;
}

function getBackendFieldErrors(error: ApiError): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};

  if (error.status === 409 && /username/i.test(error.detail)) {
    errors.username = error.detail;
    return errors;
  }

  if (!Array.isArray(error.rawDetail)) {
    return errors;
  }

  for (const item of error.rawDetail) {
    if (!isRecord(item) || typeof item.msg !== "string") {
      continue;
    }

    const location = Array.isArray(item.loc) ? item.loc.map(String) : [];
    const fieldName = getProfileFieldFromLocation(location);
    const message = cleanBackendValidationMessage(item.msg);

    if (fieldName) {
      errors[fieldName] = message;
      continue;
    }

    if (/available_to/i.test(message)) {
      errors.available_to = message;
    }
  }

  return errors;
}

function validateFormFields(
  formData: ProfileFormData,
  profileOptions?: ProfileOptionsResponse | null,
): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};

  for (const fieldName of profileFieldNames) {
    const message = validateField(
      fieldName,
      formData[fieldName],
      formData,
      profileOptions,
      true,
    );

    if (message) {
      errors[fieldName] = message;
    }
  }

  return errors;
}

function getIncompleteProfileDetail(
  error: ApiError,
): IncompleteProfileDetail | null {
  if (error.status !== 409 || !isRecord(error.rawDetail)) {
    return null;
  }

  if (error.rawDetail.code !== incompleteProfileCode) {
    return null;
  }

  const completeness = error.rawDetail.profile_completeness;

  if (!isRecord(completeness) || !Array.isArray(completeness.missing_fields)) {
    return {
      code: incompleteProfileCode,
      message:
        typeof error.rawDetail.message === "string"
          ? error.rawDetail.message
          : error.detail,
      profile_completeness: {
        complete: false,
        missing_fields: [],
      },
    };
  }

  return {
    code: incompleteProfileCode,
    message:
      typeof error.rawDetail.message === "string"
        ? error.rawDetail.message
        : error.detail,
    profile_completeness: {
      complete: completeness.complete === true,
      missing_fields: completeness.missing_fields.map(String),
    },
  };
}

function formatMissingField(fieldName: string) {
  return matchingFieldLabels[fieldName] || fieldName.replace(/_/g, " ");
}

export default function ProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileFormData>(emptyProfile);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [profileOptions, setProfileOptions] =
    useState<ProfileOptionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingIncompleteSave, setPendingIncompleteSave] =
    useState<ProfileCompleteness | null>(null);
  const token = useMemo(() => getValidAuthToken(), []);

  useEffect(() => {
    if (!success) {
      return;
    }

    setIsSuccessVisible(true);

    const fadeTimer = window.setTimeout(() => {
      setIsSuccessVisible(false);
    }, SUCCESS_VISIBLE_DURATION_MS);
    const clearTimer = window.setTimeout(() => {
      setSuccess("");
    }, SUCCESS_CLEAR_DURATION_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(clearTimer);
    };
  }, [success]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const optionsResponse = await apiRequest<ProfileOptionsResponse>(
          "/profile/options",
          {
            token,
          },
        );
        setProfileOptions(optionsResponse);

        const response = await apiRequest<ProfileResponse>("/profile", {
          token,
        });

        if (response.profile) {
          setFormData(profileToForm(response.profile, optionsResponse.enum_options));
          setFieldErrors({});
          return;
        }

        const defaultProfile = fallbackProfileData();
        const createdProfile = await apiRequest<{ profile: TravelProfile }>(
          "/profile?confirm_incomplete=true",
          {
            method: "PUT",
            token,
            body: JSON.stringify(
              formToPayload(defaultProfile, optionsResponse.enum_options),
            ),
          },
        );

        setFormData(
          profileToForm(createdProfile.profile, optionsResponse.enum_options),
        );
        setFieldErrors({});
      } catch (caughtError) {
        if (caughtError instanceof ApiError && caughtError.status === 401) {
          clearAuth();
          router.push("/login");
          return;
        }

        setError(
          caughtError instanceof ApiError
            ? caughtError.detail
            : "Unable to load profile.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [router, token]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const fieldName = event.target.name as keyof ProfileFormData;
    const fieldValue = event.target.value;
    const nextFormData = {
      ...formData,
      [fieldName]: fieldValue,
    };

    setFormData(nextFormData);

    const dependentFieldName =
      fieldName === "available_from"
        ? "available_to"
        : fieldName === "available_to"
          ? "available_from"
          : null;

    if (
      fieldErrors[fieldName] ||
      (dependentFieldName && fieldErrors[dependentFieldName])
    ) {
      setFieldErrors((previous) =>
        withoutEmptyErrors({
          ...previous,
          [fieldName]: validateField(
            fieldName,
            fieldValue,
            nextFormData,
            profileOptions,
            true,
          ),
          ...(dependentFieldName
            ? {
                [dependentFieldName]: validateField(
                  dependentFieldName,
                  nextFormData[dependentFieldName],
                  nextFormData,
                  profileOptions,
                  true,
                ),
              }
            : {}),
        }),
      );
    }
  };

  const handleBlur = (
    event: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const fieldName = event.target.name as keyof ProfileFormData;
    const message = validateField(
      fieldName,
      event.target.value,
      formData,
      profileOptions,
      true,
    );

    setFieldErrors((previous) =>
      withoutEmptyErrors({
        ...previous,
        [fieldName]: message,
      }),
    );
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((previous) => {
      const selectedInterests = new Set(toList(previous.interests));

      if (selectedInterests.has(interest)) {
        selectedInterests.delete(interest);
      } else {
        selectedInterests.add(interest);
      }

      return {
        ...previous,
        interests: Array.from(selectedInterests).join(", "),
      };
    });

    if (fieldErrors.interests) {
      const selectedInterests = new Set(toList(formData.interests));

      if (selectedInterests.has(interest)) {
        selectedInterests.delete(interest);
      } else {
        selectedInterests.add(interest);
      }

      const nextFormData = {
        ...formData,
        interests: Array.from(selectedInterests).join(", "),
      };

      setFieldErrors((previous) =>
        withoutEmptyErrors({
          ...previous,
          interests: validateField(
            "interests",
            nextFormData.interests,
            nextFormData,
            profileOptions,
            true,
          ),
        }),
      );
    }
  };

  const saveProfile = async (confirmIncomplete: boolean) => {
    if (!token) {
      router.push("/login");
      return;
    }

    setError("");
    setSuccess("");
    setFieldErrors((previous) =>
      withoutEmptyErrors({
        ...previous,
        ...validateFormFields(formData, profileOptions),
      }),
    );
    setIsSaving(true);

    try {
      const response = await apiRequest<ProfileSaveResponse>(
        confirmIncomplete ? "/profile?confirm_incomplete=true" : "/profile",
        {
          method: "PUT",
          token,
          body: JSON.stringify(formToPayload(formData, profileOptions?.enum_options)),
        },
      );

      const refreshedProfile = await apiRequest<ProfileResponse>("/profile", {
        token,
      });
      const savedProfile = refreshedProfile.profile || response.profile;

      setFormData(profileToForm(savedProfile, profileOptions?.enum_options));
      setFieldErrors({});
      setPendingIncompleteSave(null);
      setSuccess(PROFILE_SAVE_SUCCESS_MESSAGE);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        clearAuth();
        router.push("/login");
        return;
      }

      if (caughtError instanceof ApiError) {
        const incompleteProfileDetail = getIncompleteProfileDetail(caughtError);

        if (incompleteProfileDetail?.profile_completeness) {
          setPendingIncompleteSave(
            incompleteProfileDetail.profile_completeness,
          );
          return;
        }

        const backendFieldErrors = getBackendFieldErrors(caughtError);

        if (Object.keys(backendFieldErrors).length) {
          setFieldErrors((previous) => ({
            ...previous,
            ...backendFieldErrors,
          }));
          return;
        }
      }

      setError(
        caughtError instanceof ApiError
          ? caughtError.detail
          : "Unable to save profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await saveProfile(false);
  };

  const handleSaveIncompleteProfile = async () => {
    await saveProfile(true);
  };

  return (
    <AuthGuard>
      <PageShell
        description="A permanent travel profile for the details that rarely change, ready for future matching and planning."
        eyebrow="Travel profile"
        title="Your CoVoyage Passport"
      >
        {success ? (
          <div className="pointer-events-none fixed left-0 right-0 top-24 z-50 px-5 sm:px-8">
            <p
              className={`mx-auto max-w-2xl rounded-[4px] border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700 shadow-lg shadow-stone-900/5 transition-opacity duration-300 ${
                isSuccessVisible ? "opacity-100" : "opacity-0"
              }`}
              role="status"
              aria-live="polite"
            >
              {success}
            </p>
          </div>
        ) : null}
        {pendingIncompleteSave ? (
          <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/40 px-5">
            <div className="w-full max-w-lg rounded-[8px] border border-stone-200 bg-white p-6 shadow-xl">
              <h2 className="font-serif text-3xl text-stone-900">
                Profile incomplete
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                Your profile is incomplete. You can save your progress, but you
                will not be able to use Find Your Tribe until all required
                fields are completed.
              </p>
              {pendingIncompleteSave.missing_fields.length ? (
                <div className="mt-5 rounded-[4px] border border-stone-200 bg-stone-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">
                    Required for matching
                  </p>
                  <ul className="mt-3 grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
                    {pendingIncompleteSave.missing_fields.map((fieldName) => (
                      <li key={fieldName}>{formatMissingField(fieldName)}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button
                  disabled={isSaving}
                  type="button"
                  variant="outline"
                  onClick={() => setPendingIncompleteSave(null)}
                >
                  Cancel
                </Button>
                <Button
                  disabled={isSaving}
                  type="button"
                  onClick={handleSaveIncompleteProfile}
                >
                  {isSaving ? "Saving..." : "Save Anyway"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
        <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <ContentCard className="h-fit text-center">
              <div className="mx-auto grid h-36 w-36 place-items-center rounded-full border border-dashed border-stone-300 bg-[#f4eee4] text-stone-500">
                <Camera className="h-8 w-8" />
              </div>
              <h2 className="mt-6 font-serif text-3xl text-stone-900">
                Profile Picture
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                Placeholder upload area for a future profile photo.
              </p>
            </ContentCard>

            <form className="grid gap-6" noValidate onSubmit={handleSubmit}>
              {error ? (
                <p className="rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
              {isLoading ? (
                <ContentCard>
                  <p className="text-sm text-stone-600">Loading profile...</p>
                </ContentCard>
              ) : (
                sections.map((section) => (
                  <ContentCard key={section.title}>
                    <h2 className="font-serif text-3xl text-stone-900">
                      {section.title}
                    </h2>
                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      {section.fields.map((field) => {
                        const fieldOptions =
                          field.options ||
                          getEnumOptions(
                            field.name,
                            profileOptions?.enum_options,
                          );

                        return (
                          <FormField
                            key={field.name}
                            label={field.label}
                            name={field.name}
                            placeholder={
                              listFields.has(field.name)
                                ? `${field.label}, comma separated`
                                : field.label
                            }
                            type={field.type}
                            options={fieldOptions}
                            optionPlaceholder={
                              fieldOptions ? `Select ${field.label}` : undefined
                            }
                            value={formData[field.name]}
                            disabled={isSaving}
                            error={fieldErrors[field.name]}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required={
                              isRequiredAiMatchingField(field.name, profileOptions)
                            }
                          />
                        );
                      })}
                      {section.textarea ? (
                        <FormField
                          className="sm:col-span-2"
                          label={section.textarea.label}
                          name={section.textarea.name}
                          placeholder="Share your travel rhythm, interests, and the kind of journeys you love."
                          textarea
                          value={formData[section.textarea.name]}
                          disabled={isSaving}
                          error={fieldErrors[section.textarea.name]}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      ) : null}
                      {section.title === "Default Travel Preferences" ? (
                        <div className="sm:col-span-2">
                          <p className="text-sm font-medium text-stone-700">
                            Favourite Interests
                          </p>
                          <div className="mt-3 grid gap-4">
                            {Object.entries(interestTagCategories).map(
                              ([category, tags]) => (
                                <fieldset
                                  className="rounded-[4px] border border-stone-200 bg-white/60 p-4"
                                  key={category}
                                >
                                  <legend className="px-1 text-xs font-medium uppercase tracking-[0.22em] text-stone-500">
                                    {category}
                                  </legend>
                                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {tags.map((tag) => (
                                      <label
                                        className="flex items-center gap-2 text-sm text-stone-700"
                                        key={tag}
                                      >
                                        <input
                                          checked={toList(formData.interests).includes(tag)}
                                          className="h-4 w-4 accent-stone-900"
                                          disabled={isSaving}
                                          type="checkbox"
                                          onChange={() => handleInterestToggle(tag)}
                                        />
                                        {tag}
                                      </label>
                                    ))}
                                  </div>
                                </fieldset>
                              ),
                            )}
                          </div>
                          {fieldErrors.interests ? (
                            <p className="mt-3 text-sm text-red-700">
                              {fieldErrors.interests}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </ContentCard>
                ))
              )}
              <Button
                className="w-fit"
                disabled={isLoading || isSaving}
                size="lg"
                type="submit"
              >
                {isSaving ? "Saving Profile..." : "Save Profile"}
              </Button>
            </form>
          </div>
        </section>
      </PageShell>
    </AuthGuard>
  );
}
