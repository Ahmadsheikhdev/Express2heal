"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PrivacySettingsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login");
    },
  });

  const router = useRouter();
  
  // State for privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    dataSharing: true,
    aiModelTraining: true,
    thirdPartyIntegrations: true,
  });
  
  // State for display name
  const [displayName, setDisplayName] = useState("");
  const [useDisplayNameInChats, setUseDisplayNameInChats] = useState(false);
  
  // State for UI
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Fetch current privacy settings
  useEffect(() => {
    if (status === "authenticated") {
      fetchPrivacySettings();
    }
  }, [status]);

  const fetchPrivacySettings = async () => {
    try {
      const response = await fetch("/api/privacy-settings", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (response.ok) {
        // Set privacy settings from the response
        if (result.privacySettings) {
          setPrivacySettings(result.privacySettings);
        }
        
        // Set display name from the response
        if (result.displayName) {
          setDisplayName(result.displayName);
        }
        
        // Set useDisplayNameInChats from the response
        if (result.useDisplayNameInChats !== undefined) {
          setUseDisplayNameInChats(result.useDisplayNameInChats);
        }
      } else {
        setMessage(result.error || "Failed to fetch privacy settings.");
      }
    } catch (error) {
      console.error("Error fetching privacy settings:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/privacy-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          privacySettings,
          displayName,
          useDisplayNameInChats,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Privacy settings updated successfully!");
      } else {
        setMessage(result.error || "Failed to update privacy settings.");
      }
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    setShowResetConfirm(true);
  };

  const confirmResetSettings = () => {
    // Reset to default values
    setPrivacySettings({
      profileVisibility: "public",
      dataSharing: true,
      aiModelTraining: true,
      thirdPartyIntegrations: true,
    });
    setDisplayName(session?.user?.name || "");
    setUseDisplayNameInChats(false);
    setShowResetConfirm(false);
    setMessage("Settings reset to default values. Click Save to apply changes.");
  };

  const cancelResetSettings = () => {
    setShowResetConfirm(false);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-navy-500">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-black text-center">
            Loading...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-navy-500">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-black text-center">
          Privacy Settings
        </h2>
        {message && (
          <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded">
            {message}
          </div>
        )}
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Profile Visibility */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Profile Visibility
            </label>
            <select
              value={privacySettings.profileVisibility}
              onChange={(e) =>
                setPrivacySettings({
                  ...privacySettings,
                  profileVisibility: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="public">Public (Visible to everyone)</option>
              <option value="private">Private (Only visible to you)</option>
              <option value="friends">Friends (Only visible to connections)</option>
            </select>
          </div>

          {/* Data Sharing */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={privacySettings.dataSharing}
                onChange={(e) =>
                  setPrivacySettings({
                    ...privacySettings,
                    dataSharing: e.target.checked,
                  })
                }
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-black">
                Allow anonymized data sharing for research purposes
              </span>
            </label>
          </div>

          {/* AI Model Training */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={privacySettings.aiModelTraining}
                onChange={(e) =>
                  setPrivacySettings({
                    ...privacySettings,
                    aiModelTraining: e.target.checked,
                  })
                }
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-black">
                Participate in AI model training (helps improve our services)
              </span>
            </label>
          </div>

          {/* Third-party Integrations */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={privacySettings.thirdPartyIntegrations}
                onChange={(e) =>
                  setPrivacySettings({
                    ...privacySettings,
                    thirdPartyIntegrations: e.target.checked,
                  })
                }
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-black">
                Allow third-party integrations
              </span>
            </label>
          </div>

          {/* Display Name */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium text-black mb-2">
              Display Name Settings
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-300"
              />
              <p className="text-xs text-gray-500 mt-1">
                This name will be used instead of your email in group chats if enabled below.
              </p>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useDisplayNameInChats}
                  onChange={(e) => setUseDisplayNameInChats(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-black">
                  Use display name in group chats instead of email
                </span>
              </label>
            </div>
          </div>

          {/* Privacy Policy Link */}
          <div className="text-center mt-4">
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              View our Privacy Policy
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between space-x-4">
            <button
              type="button"
              onClick={handleResetSettings}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Reset to Default
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-bold mb-4 text-black">Confirm Reset</h3>
              <p className="text-gray-700 mb-4">
                Are you sure you want to reset all privacy settings to default values?
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelResetSettings}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmResetSettings}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 