import React from 'react';
import { usePostAuthRedirect } from '@/_core/hooks/usePostAuthRedirect';

/**
 * Component that handles post-auth redirects
 * Wraps the usePostAuthRedirect hook so it runs at app level
 */
export const PostAuthRedirectHandler: React.FC = () => {
  usePostAuthRedirect();
  return null;
};

export default PostAuthRedirectHandler;
