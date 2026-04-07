"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  CircleAlert,
  CircleUserRound,
  CreditCard,
  Link2,
  LogOut,
  Plus,
  Send,
  Shield,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/store/user.store";
import { logout } from "@/utils/logout";
import { useRouter } from "next/navigation";

type SettingsTab =
  | "profile"
  | "billing"
  | "integrations"
  | "publishing"
  | "pricing"
  | "account";

interface ProfileModalProps {
  children: React.ReactNode;
}

const tabs: Array<{ key: SettingsTab; label: string; icon: React.ReactNode }> =
  [
    {
      key: "profile",
      label: "Profile",
      icon: <CircleUserRound className="h-4 w-4" />,
    },
    {
      key: "billing",
      label: "Billing",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      key: "integrations",
      label: "Integrations",
      icon: <Link2 className="h-4 w-4" />,
    },
    {
      key: "publishing",
      label: "Publishing",
      icon: <Send className="h-4 w-4" />,
    },
    {
      key: "pricing",
      label: "View Pricing",
      icon: <Sparkles className="h-4 w-4" />,
    },
    { key: "account", label: "Account", icon: <Shield className="h-4 w-4" /> },
  ];

const toTitle = (value?: string) => {
  if (!value) return "Free";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID;

const loadGoogleScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google script"));
    document.body.appendChild(script);
  });
};

const requestGoogleAccessToken = async (scope: string): Promise<string> => {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      "Missing Google Client ID. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID and restart the dev server.",
    );
  }

  await loadGoogleScript("https://accounts.google.com/gsi/client");

  return await new Promise<string>((resolve, reject) => {
    const googleRef = (window as any).google;
    if (!googleRef?.accounts?.oauth2) {
      reject(new Error("Google OAuth client not available"));
      return;
    }

    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error("Google authentication was interrupted or timed out"));
    }, 60000);

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      fn();
    };

    const client = googleRef.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope,
      callback: (response: { access_token?: string; error?: string }) => {
        if (response?.error) {
          finish(() => reject(new Error(response.error)));
          return;
        }
        const accessToken = response?.access_token;
        if (!accessToken) {
          finish(() => reject(new Error("No access token received")));
          return;
        }
        finish(() => resolve(accessToken));
      },
      error_callback: (error: { type?: string }) => {
        const type = error?.type || "unknown_error";
        finish(() => reject(new Error(type)));
      },
    });

    client.requestAccessToken();
  });
};

export function ProfileModal({ children }: ProfileModalProps) {
  const {
    user,
    googleDriveConnected,
    googleCalendarConnected,
    setGoogleDriveConnected,
    setGoogleCalendarConnected,
  } = useUserStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [newEmail, setNewEmail] = useState("");
  const [isConnectingGoogleDrive, setIsConnectingGoogleDrive] = useState(false);
  const [isConnectingGoogleCalendar, setIsConnectingGoogleCalendar] =
    useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    nickname: "",
    username: "",
    school: "",
    major: "",
  });
  const { updateUserDetails } = useUserStore();
  const route = useRouter();

  useEffect(() => {
    setProfileForm((prev) => ({
      ...prev,
      fullName: user?.name ?? "",
      nickname: user?.nickname ?? "",
      username:
        user?.username ??
        (user?.name ? user.name.toLowerCase().replace(/\s+/g, "-") : ""),
      school: user?.school ?? "",
      major: user?.major ?? user?.department ?? "",
    }));
  }, [
    user?.name,
    user?.nickname,
    user?.username,
    user?.school,
    user?.major,
    user?.department,
  ]);

  const planName = useMemo(
    () => toTitle(user?.subscription?.plan),
    [user?.subscription?.plan],
  );

  const primaryEmail = user?.email || "No email attached";

  const saveProfile = async () => {
    await updateUserDetails(profileForm);
    toast.success("Profile updated successfully.");
  };

  const addEmail = () => {
    if (!newEmail) {
      toast.error("Enter an email first.");
      return;
    }
    toast.success("Email added locally. Connect API to persist changes.");
    setNewEmail("");
  };

  const handleSignOut = async () => {
    await logout();
    route.push("/auth/login");
  };

  const handleConnectGoogleDrive = async () => {
    try {
      setIsConnectingGoogleDrive(true);
      await requestGoogleAccessToken(
        "https://www.googleapis.com/auth/drive.readonly",
      );

      setGoogleDriveConnected(true);
      toast.success("Google Drive connected. You can now import in Upload.");
    } catch (error) {
      console.error("Failed to connect Google Drive:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      if (errorMessage === "popup_closed" || errorMessage === "access_denied") {
        toast.info("Google Drive connection cancelled.");
      } else if (errorMessage.includes("Missing Google Client ID")) {
        toast.error(errorMessage);
      } else {
        toast.error("Failed to connect Google Drive");
      }
    } finally {
      setIsConnectingGoogleDrive(false);
    }
  };

  const handleConnectGoogleCalendar = async () => {
    try {
      setIsConnectingGoogleCalendar(true);
      await requestGoogleAccessToken(
        "https://www.googleapis.com/auth/calendar.events",
      );

      setGoogleCalendarConnected(true);
      toast.success("Google Calendar connected. You can now sync deadlines.");
    } catch (error) {
      console.error("Failed to connect Google Calendar:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      if (errorMessage === "popup_closed" || errorMessage === "access_denied") {
        toast.info("Google Calendar connection cancelled.");
      } else if (errorMessage.includes("Missing Google Client ID")) {
        toast.error(errorMessage);
      } else {
        toast.error("Failed to connect Google Calendar");
      }
    } finally {
      setIsConnectingGoogleCalendar(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="min-w-[1100px] border-[#232323] bg-[#0f1012] p-0 text-[#f5f5f5]"
        showCloseButton
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Account settings</DialogTitle>
          <DialogDescription>
            Manage your profile, pricing, integrations, and account actions.
          </DialogDescription>
        </DialogHeader>

        <div className="grid h-[72vh] min-h-[580px] grid-cols-1 md:grid-cols-[220px_1fr]">
          <aside className="border-b border-[#1f1f1f] bg-[#15171b] p-3 md:border-r md:border-b-0">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <Button
                  key={tab.key}
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTab(tab.key)}
                  className={`h-10 w-full justify-start gap-2 rounded-lg px-3 text-sm ${
                    activeTab === tab.key
                      ? "bg-[#3a2118] text-[#ff8a66] hover:bg-[#3a2118]"
                      : "text-[#c8c8c8] hover:bg-[#20242a]"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </Button>
              ))}
            </div>
          </aside>

          <section className="overflow-y-auto p-5 md:p-7">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-semibold">Profile</h2>

                <div className="flex items-center gap-3 rounded-xl border border-[#252525] bg-[#17191d] p-4">
                  <Image
                    src={user?.image_url || "/assets/orange.png"}
                    alt="Profile photo"
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium">Profile Photo</p>
                    <p className="text-xs text-[#a3a3a3]">
                      Click to upload a new photo. Max size: 10MB
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs text-[#a3a3a3]">Full name</p>
                    <Input
                      value={profileForm.fullName}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      className="h-10 border-[#2e2e2e] bg-[#26282d]"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-[#a3a3a3]">
                      Nickname (optional)
                    </p>
                    <Input
                      value={profileForm.nickname}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          nickname: e.target.value,
                        }))
                      }
                      className="h-10 border-[#2e2e2e] bg-[#26282d]"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-[#a3a3a3]">Username / Alias</p>
                    <Input
                      value={profileForm.username}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className="h-10 border-[#2e2e2e] bg-[#26282d]"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-[#a3a3a3]">
                      University / School
                    </p>
                    <Input
                      value={profileForm.school}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          school: e.target.value,
                        }))
                      }
                      className="h-10 border-[#2e2e2e] bg-[#26282d]"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-xs text-[#a3a3a3]">
                      Major (if applicable)
                    </p>
                    <Input
                      value={profileForm.major}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          major: e.target.value,
                        }))
                      }
                      className="h-10 border-[#2e2e2e] bg-[#26282d]"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    className="bg-[#ff6a3d] px-5 text-white hover:bg-[#f25a2a]"
                    onClick={saveProfile}
                  >
                    Save Changes
                  </Button>
                </div>

                {/* <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    Emails
                    <CircleAlert className="h-3.5 w-3.5 text-[#8a8a8a]" />
                  </div>
                  <div className="rounded-lg border border-[#2b2b2b] bg-[#23262b] p-3">
                    <p className="text-sm">{primaryEmail}</p>
                    <p className="text-xs text-[#8e8e8e]">Primary email</p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Add another email address"
                      className="h-10 border-[#2e2e2e] bg-[#26282d]"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-10 bg-[#f2f2f2] text-black hover:bg-white"
                      onClick={addEmail}
                    >
                      <Plus className="h-4 w-4" /> Add Email
                    </Button>
                  </div>
                </div> */}
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-5">
                <h2 className="text-3xl font-semibold">Billing</h2>
                <div className="rounded-xl border border-[#252525] bg-[#17191d] p-4">
                  <p className="text-sm text-[#9f9f9f]">Current plan</p>
                  <p className="mt-1 text-2xl font-semibold">{planName}</p>
                  <p className="mt-1 text-xs text-[#8a8a8a]">
                    Manage upgrades, renewals, and invoices from this panel.
                  </p>
                </div>
                <div className="rounded-xl border border-[#252525] bg-[#17191d] p-4">
                  <p className="mb-2 text-sm font-medium">Payment method</p>
                  <p className="text-sm text-[#9f9f9f]">
                    No payment method connected yet.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-3 bg-[#22262c] text-[#e8e8e8] hover:bg-[#2c3139]"
                    onClick={() =>
                      toast.info(
                        "Connect payment method when backend endpoint is ready.",
                      )
                    }
                  >
                    Connect card
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "integrations" && (
              <div className="space-y-5">
                <h2 className="text-3xl font-semibold">Integrations</h2>
                <p className="text-sm text-[#a2a2a2]">
                  Connect your knowledge bases so Clark can reference and sync
                  study material.
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg border border-[#2c2c2c] bg-[#23262b] px-4 py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Image
                          src="/assets/integrations/drive.png"
                          alt="Google Drive"
                          width={20}
                          height={20}
                          className="h-5 w-5"
                        />
                        <p className="font-medium">Google Drive</p>
                      </div>
                      <p className="text-xs text-[#9b9b9b]">
                        {googleDriveConnected
                          ? "Connected"
                          : "Connect to import files in Upload"}
                      </p>
                    </div>
                    {googleDriveConnected ? (
                      <Button
                        variant="secondary"
                        className="h-8 bg-[#2d3036] text-[#f2f2f2] hover:bg-[#393d45]"
                        onClick={() => {
                          setGoogleDriveConnected(false);
                          toast.success("Google Drive disconnected");
                        }}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        className="h-8 bg-[#2d3036] text-[#f2f2f2] hover:bg-[#393d45]"
                        onClick={handleConnectGoogleDrive}
                        disabled={isConnectingGoogleDrive}
                      >
                        {isConnectingGoogleDrive ? "Connecting..." : "Connect"}
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-[#2c2c2c] bg-[#23262b] px-4 py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Image
                          src="/assets/integrations/calendar.png"
                          alt="Google Calendar"
                          width={20}
                          height={20}
                          className="h-5 w-5"
                        />
                        <p className="font-medium">Google Calendar</p>
                      </div>
                      <p className="text-xs text-[#9b9b9b]">
                        {googleCalendarConnected
                          ? "Connected"
                          : "Connect to sync study tasks and deadlines"}
                      </p>
                    </div>
                    {googleCalendarConnected ? (
                      <Button
                        variant="secondary"
                        className="h-8 bg-[#2d3036] text-[#f2f2f2] hover:bg-[#393d45]"
                        onClick={() => {
                          setGoogleCalendarConnected(false);
                          toast.success("Google Calendar disconnected");
                        }}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        className="h-8 bg-[#2d3036] text-[#f2f2f2] hover:bg-[#393d45]"
                        onClick={handleConnectGoogleCalendar}
                        disabled={isConnectingGoogleCalendar}
                      >
                        {isConnectingGoogleCalendar
                          ? "Connecting..."
                          : "Connect"}
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-[#2c2c2c] bg-[#23262b] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/assets/integrations/notion.png"
                        alt="Notion"
                        width={20}
                        height={20}
                        className="h-5 w-5"
                      />
                      <p className="font-medium">Notion</p>
                    </div>
                    <Button
                      variant="secondary"
                      className="h-8 bg-[#2d3036] text-[#f2f2f2] hover:bg-[#393d45]"
                      onClick={() =>
                        toast.info("Notion connection coming soon.")
                      }
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "publishing" && (
              <div className="space-y-5">
                <h2 className="text-3xl font-semibold">Publishing</h2>
                <div className="rounded-xl border border-[#252525] bg-[#17191d] p-4">
                  <p className="text-sm font-medium">Custom domains</p>
                  <p className="text-sm text-[#a2a2a2]">
                    Use your own domain when sharing journals publicly.
                  </p>
                  <Button
                    className="mt-3 bg-[#ff6a3d] text-white hover:bg-[#f25a2a]"
                    onClick={() =>
                      toast.info("Domain setup wizard will be connected here.")
                    }
                  >
                    Set up domain
                  </Button>
                </div>
                <div className="rounded-xl border border-[#252525] bg-[#17191d] p-4">
                  <p className="text-sm font-medium">SEO & visibility</p>
                  <p className="text-sm text-[#a2a2a2]">
                    Control whether your public journals are indexed by search
                    engines.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-3 bg-[#22262c] text-[#e8e8e8] hover:bg-[#2c3139]"
                    onClick={() =>
                      toast.success(
                        "Saved. Visibility preference updated locally.",
                      )
                    }
                  >
                    Keep journals private
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "pricing" && (
              <div className="space-y-5">
                <h2 className="text-3xl font-semibold">View Pricing</h2>
                <div className="rounded-lg bg-[#3a2416] px-4 py-2 text-sm text-[#ffb088]">
                  🎓 Students get 20% off with an education email.
                </div>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                  <div className="flex h-full flex-col rounded-xl border border-[#7a3f24] bg-[#17191d] p-4">
                    <p className="text-xl font-semibold">Free (Solo)</p>
                    <p className="text-sm text-[#9b9b9b]">
                      Individual student (trial)
                    </p>
                    <ul className="mt-3 flex-1 space-y-1 text-sm text-[#d6d6d6]">
                      <li>• Workspaces: 3</li>
                      <li>• File uploads: up to 2 files</li>
                      <li>• AI PDF analysis, Q&A & explanations</li>
                      <li>• AI-generated quizzes: Basic</li>
                      <li>• Progress tracking: Basic</li>
                      <li>• Sharing: none</li>
                      <li>• Flashcards: yes</li>
                      <li>• Material generation: summary only</li>
                    </ul>
                    <Button className="mt-4 w-full bg-[#2a2f37] hover:bg-[#343b45]">
                      Current Plan
                    </Button>
                  </div>
                  <div className="flex h-full flex-col rounded-xl border border-[#7a3f24] bg-[#17191d] p-4">
                    <p className="text-xs text-[#ff9b6b]">Most Popular</p>
                    <p className="text-xl font-semibold">Pro (Scholar)</p>
                    <p className="text-sm text-[#9b9b9b]">
                      Serious individual student
                    </p>
                    <ul className="mt-3 flex-1 space-y-1 text-sm text-[#d6d6d6]">
                      <li>• Workspaces: 10</li>
                      <li>• File uploads: limited per workspace (5)</li>
                      <li>• AI PDF analysis, Q&A & explanations</li>
                      <li>• AI-generated quizzes: same as free</li>
                      <li>• Voice chat (Whisper): yes</li>
                      <li>• Progress tracking: advanced insights</li>
                      <li>• Sharing: all, up to 5 people</li>
                      <li>• Flashcards: downloadable as zip</li>
                      <li>• Material generation: 3 full/day</li>
                    </ul>
                    <Button
                      className="mt-4 w-full bg-[#ff6a3d] text-white hover:bg-[#f25a2a]"
                      onClick={() =>
                        toast.info(
                          "Upgrade flow can be connected to payment initialization.",
                        )
                      }
                    >
                      Upgrade
                    </Button>
                  </div>
                  <div className="flex h-full flex-col rounded-xl border border-[#7a3f24] bg-[#17191d] p-4">
                    <p className="text-xl font-semibold">
                      Teams (Collaborative)
                    </p>
                    <p className="text-sm text-[#9b9b9b]">
                      Study groups & teams
                    </p>
                    <ul className="mt-3 flex-1 space-y-1 text-sm text-[#d6d6d6]">
                      <li>• Workspaces: unlimited + sharing</li>
                      <li>• File uploads: unlimited</li>
                      <li>• AI PDF analysis, Q&A & explanations</li>
                      <li>• AI-generated quizzes: advanced + sharing</li>
                      <li>• Voice chat (Whisper): yes</li>
                      <li>• Collaborative whiteboard: yes</li>
                      <li>• Real-time collaboration: yes</li>
                      <li>• Comments & mentions: yes</li>
                      <li>• Sharing: unlimited</li>
                      <li>• Flashcards zip + unlimited materials</li>
                    </ul>
                    <Button
                      className="mt-4 w-full bg-[#ffb089] text-[#3a1508] hover:bg-[#ffa074]"
                      onClick={() =>
                        toast.info(
                          "Scholar checkout can be wired to your payment provider.",
                        )
                      }
                    >
                      Upgrade
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="space-y-5">
                <h2 className="text-3xl font-semibold">Account</h2>
                <div className="space-y-3">
                  <div className="rounded-xl border border-[#252525] bg-[#17191d] p-4">
                    <p className="text-sm font-medium">Request your data</p>
                    <p className="mb-3 text-xs text-[#9f9f9f]">
                      Export your platform data in one package.
                    </p>
                    <Button
                      variant="secondary"
                      className="w-full bg-[#f4f4f4] text-black hover:bg-white"
                      onClick={() =>
                        toast.info(
                          "Data export request has been queued locally.",
                        )
                      }
                    >
                      Request Data
                    </Button>
                  </div>
                  <div className="rounded-xl border border-[#252525] bg-[#17191d] p-4">
                    <p className="text-sm font-medium">Reset your password</p>
                    <p className="mb-3 text-xs text-[#9f9f9f]">
                      A reset link will be sent to your primary email.
                    </p>
                    <Button
                      variant="secondary"
                      className="w-full bg-[#f4f4f4] text-black hover:bg-white"
                      onClick={() =>
                        toast.info(
                          "Password reset action is ready to be connected.",
                        )
                      }
                    >
                      Reset Password
                    </Button>
                  </div>
                  <div className="rounded-xl border border-[#252525] bg-[#17191d] p-4">
                    <p className="text-sm font-medium">
                      Sign out of your account
                    </p>
                    <p className="mb-3 text-xs text-[#9f9f9f]">
                      You will need to sign in again to access your account.
                    </p>
                    <Button
                      variant="secondary"
                      className="w-full bg-[#f4f4f4] text-black hover:bg-white"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
