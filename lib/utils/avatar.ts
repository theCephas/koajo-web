/**
 * Get Cloudinary URL for an avatar
 * @param avatarId - The Cloudinary public ID of the avatar
 * @param transformation - Optional Cloudinary transformation parameters
 * @returns The full Cloudinary URL
 */
export function getAvatarUrl(
  avatarId: string,
  transformation: string = "w_200,h_200,c_fill,g_face"
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "koajo";
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${avatarId}`;
}

/**
 * Get the default avatar URL
 */
export function getDefaultAvatarUrl(): string {
  return "/media/images/avatar.jpg";
}
