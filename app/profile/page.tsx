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
  getAuthToken,
  getStoredUser,
} from "@/lib/api";

type ProfileFormData = {
  name: string;
  username: string;
  age: string;
  gender: string;
  bio: string;
  profile_picture_url: string;
  travel_style: string;
  preferred_destinations: string;
  budget_range: string;
  preferred_trip_duration: string;
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
  preferred_destinations: string[];
  interests: string[];
  languages_spoken: string[];
  previously_visited_countries: string[];
};

type ProfileResponse = {
  profile_created: boolean;
  profile: TravelProfile | null;
};

type ProfileField = {
  label: string;
  name: keyof ProfileFormData;
  type?: string;
};

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
  bio: "",
  profile_picture_url: "",
  travel_style: "",
  preferred_destinations: "",
  budget_range: "",
  preferred_trip_duration: "",
  interests: "",
  languages_spoken: "",
  country: "",
  city: "",
  previously_visited_countries: "",
  linkedin: "",
  instagram: "",
  personal_website: "",
};

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
  const email = storedUser?.email || decodeTokenSubject(getAuthToken());
  const emailName = email.split("@")[0] || "traveler";
  const username = emailName.replace(/[^a-z0-9._-]/gi, "").slice(0, 50);

  return {
    ...emptyProfile,
    name: storedUser?.name || emailName,
    username: username.length >= 3 ? username : "traveler",
  };
}

function profileToForm(profile: TravelProfile): ProfileFormData {
  return {
    name: profile.name ?? "",
    username: profile.username ?? "",
    age: profile.age ? String(profile.age) : "",
    gender: profile.gender ?? "",
    bio: profile.bio ?? "",
    profile_picture_url: profile.profile_picture_url ?? "",
    travel_style: profile.travel_style ?? "",
    preferred_destinations: profile.preferred_destinations.join(", "),
    budget_range: profile.budget_range ?? "",
    preferred_trip_duration: profile.preferred_trip_duration ?? "",
    interests: profile.interests.join(", "),
    languages_spoken: profile.languages_spoken.join(", "),
    country: profile.country ?? "",
    city: profile.city ?? "",
    previously_visited_countries:
      profile.previously_visited_countries.join(", "),
    linkedin: profile.linkedin ?? "",
    instagram: profile.instagram ?? "",
    personal_website: profile.personal_website ?? "",
  };
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

function formToPayload(formData: ProfileFormData) {
  return {
    name: formData.name,
    username: formData.username,
    age: formData.age ? Number(formData.age) : null,
    gender: toNullableString(formData.gender),
    bio: toNullableString(formData.bio),
    profile_picture_url: toNullableString(formData.profile_picture_url),
    travel_style: toNullableString(formData.travel_style),
    preferred_destinations: toList(formData.preferred_destinations),
    budget_range: toNullableString(formData.budget_range),
    preferred_trip_duration: toNullableString(formData.preferred_trip_duration),
    interests: toList(formData.interests),
    languages_spoken: toList(formData.languages_spoken),
    country: toNullableString(formData.country),
    city: toNullableString(formData.city),
    previously_visited_countries: toList(
      formData.previously_visited_countries,
    ),
    linkedin: toNullableString(formData.linkedin),
    instagram: toNullableString(formData.instagram),
    personal_website: toNullableString(formData.personal_website),
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileFormData>(emptyProfile);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const token = useMemo(() => getAuthToken(), []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await apiRequest<ProfileResponse>("/profile", {
          token,
        });

        if (response.profile) {
          setFormData(profileToForm(response.profile));
          return;
        }

        const defaultProfile = fallbackProfileData();
        const createdProfile = await apiRequest<{ profile: TravelProfile }>(
          "/profile",
          {
            method: "PUT",
            token,
            body: JSON.stringify(formToPayload(defaultProfile)),
          },
        );

        setFormData(profileToForm(createdProfile.profile));
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
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
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
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      router.push("/login");
      return;
    }

    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const response = await apiRequest<{ message: string; profile: TravelProfile }>(
        "/profile",
        {
          method: "PUT",
          token,
          body: JSON.stringify(formToPayload(formData)),
        },
      );

      setFormData(profileToForm(response.profile));
      setSuccess(response.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        clearAuth();
        router.push("/login");
        return;
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

  return (
    <AuthGuard>
      <PageShell
        description="A permanent travel profile for the details that rarely change, ready for future matching and planning."
        eyebrow="Travel profile"
        title="Your CoVoyage Passport"
      >
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

            <form className="grid gap-6" onSubmit={handleSubmit}>
              {error ? (
                <p className="rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
              {success ? (
                <p className="rounded-[4px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
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
                      {section.fields.map((field) => (
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
                          value={formData[field.name]}
                          disabled={isSaving}
                          onChange={handleChange}
                          required={field.name === "name" || field.name === "username"}
                        />
                      ))}
                      {section.textarea ? (
                        <FormField
                          className="sm:col-span-2"
                          label={section.textarea.label}
                          name={section.textarea.name}
                          placeholder="Share your travel rhythm, interests, and the kind of journeys you love."
                          textarea
                          value={formData[section.textarea.name]}
                          disabled={isSaving}
                          onChange={handleChange}
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
