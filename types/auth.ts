export type Account = {
  id: string;
  name: string;
  email: string;
  budget: number;
  profilePictureUri?: string | null;
  profileBanner?: ProfileBannerMedia | null;
};

export type ProfileBannerMedia = {
  uri: string;
  type: "image" | "video";
  durationMs?: number;
};

export type RemoteAccount = Account;

export type AuthContextValue = {
  account: Account | null;
  token: string | null;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshAccount: (account: RemoteAccount) => void;
  updateProfilePicture: (uri: string | null) => Promise<void>;
  updateProfileBanner: (banner: ProfileBannerMedia | null) => Promise<void>;
};
