import { supabase } from './supabase';

const PUBLIC_DOCUMENT_MARKER = '/storage/v1/object/public/hotel-documents/';
const SIGNED_DOCUMENT_MARKER = '/storage/v1/object/sign/hotel-documents/';

export const normalizeHotelDocumentPath = (value: string): string => {
  if (!value) return '';

  try {
    const decoded = decodeURIComponent(value);
    if (decoded.includes(PUBLIC_DOCUMENT_MARKER)) {
      return decoded.split(PUBLIC_DOCUMENT_MARKER)[1].split('?')[0];
    }
    if (decoded.includes(SIGNED_DOCUMENT_MARKER)) {
      return decoded.split(SIGNED_DOCUMENT_MARKER)[1].split('?')[0];
    }
  } catch (_) {
    // Fall through and treat the value as a storage object path.
  }

  return value.replace(/^\/+/, '');
};

export const createHotelDocumentSignedUrl = async (
  pathOrUrl: string,
  expiresInSeconds = 300
): Promise<string> => {
  const objectPath = normalizeHotelDocumentPath(pathOrUrl);
  const { data, error } = await supabase.storage
    .from('hotel-documents')
    .createSignedUrl(objectPath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw error || new Error('Unable to create a secure document link.');
  }

  return data.signedUrl;
};

export const openHotelDocument = async (pathOrUrl: string): Promise<void> => {
  const signedUrl = await createHotelDocumentSignedUrl(pathOrUrl);
  window.open(signedUrl, '_blank', 'noopener,noreferrer');
};
