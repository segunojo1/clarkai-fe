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

export function ProfileModal({ children }: ProfileModalProps) {
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [newEmail, setNewEmail] = useState("");
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    nickname: "",
    username: "",
    school: "",
    major: "",
  });

  useEffect(() => {
    setProfileForm((prev) => ({
      ...prev,
      fullName: user?.name ?? "",
      username: user?.name ? user.name.toLowerCase().replace(/\s+/g, "-") : "",
    }));
  }, [user?.name]);

  const planName = useMemo(
    () => toTitle(user?.subscription?.plan),
    [user?.subscription?.plan],
  );

  const primaryEmail = user?.email || "No email attached";

  const saveProfile = () => {
    toast.success("Profile updated locally. Connect API to persist changes.");
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
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="min-w-[900px] border-[#232323] bg-[#0f1012] p-0 text-[#f5f5f5]"
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

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    Emails{" "}
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
                </div>
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
                  {["Google Drive", "Notion"].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-lg border border-[#2c2c2c] bg-[#23262b] px-4 py-3"
                    >
                      <p className="font-medium">{item}</p>
                      <Button
                        variant="secondary"
                        className="h-8 bg-[#2d3036] text-[#f2f2f2] hover:bg-[#393d45]"
                        onClick={() =>
                          toast.info(`${item} connection coming soon.`)
                        }
                      >
                        Connect
                      </Button>
                    </div>
                  ))}
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
                  <div className="rounded-xl border border-[#7a3f24] bg-[#17191d] p-4">
                    <p className="text-xl font-semibold">Free</p>
                    <p className="text-sm text-[#9b9b9b]">$0 / forever</p>
                    <ul className="mt-3 space-y-1 text-sm text-[#d6d6d6]">
                      <li>• Limited journals and chats</li>
                      <li>• Limited flashcards</li>
                      <li>• Basic knowledge integrations</li>
                    </ul>
                    <Button className="mt-4 w-full bg-[#2a2f37] hover:bg-[#343b45]">
                      Current Plan
                    </Button>
                  </div>
                  <div className="rounded-xl border border-[#7a3f24] bg-[#17191d] p-4">
                    <p className="text-xs text-[#ff9b6b]">Most Popular</p>
                    <p className="text-xl font-semibold">Explorer</p>
                    <p className="text-sm text-[#9b9b9b]">$12.50 / month</p>
                    <ul className="mt-3 space-y-1 text-sm text-[#d6d6d6]">
                      <li>• Unlimited journals and chats</li>
                      <li>• More generations and notes</li>
                      <li>• 5 AI grading sessions/week</li>
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
                  <div className="rounded-xl border border-[#7a3f24] bg-[#17191d] p-4">
                    <p className="text-xl font-semibold">Scholar</p>
                    <p className="text-sm text-[#9b9b9b]">$20.83 / month</p>
                    <ul className="mt-3 space-y-1 text-sm text-[#d6d6d6]">
                      <li>• Everything in Explorer +</li>
                      <li>• Real-time proactive AI tutor</li>
                      <li>• Unlimited grading + history</li>
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
