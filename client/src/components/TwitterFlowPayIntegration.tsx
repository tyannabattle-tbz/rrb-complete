import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Twitter, Link as LinkIcon, Copy, Send } from 'lucide-react';
import { toast } from 'sonner';

interface TwitterFlowPayIntegrationProps {
  twitterHandle: string;
  onPostCreated?: (postId: string, link: string) => void;
}

export function TwitterFlowPayIntegration({
  twitterHandle,
  onPostCreated,
}: TwitterFlowPayIntegrationProps) {
  const [showPostBuilder, setShowPostBuilder] = useState(false);
  const [postText, setPostText] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [linkText, setLinkText] = useState('Support me');
  const [generatedLink, setGeneratedLink] = useState('');
  const [postPreview, setPostPreview] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const generatePaymentLink = async () => {
    if (!paymentAmount) {
      toast.error('Please enter a payment amount');
      return;
    }

    try {
      const link = `${window.location.origin}/flowpay/links?twitter=${twitterHandle}&amount=${paymentAmount}&title=${encodeURIComponent(`Support ${twitterHandle}`)}`;
      setGeneratedLink(link);
      toast.success('Payment link generated!');
    } catch (error) {
      toast.error('Failed to generate payment link');
    }
  };

  const buildPost = () => {
    if (!postText || !generatedLink) {
      toast.error('Please enter post text and generate a payment link');
      return;
    }

    const preview = `${postText}\n\n${linkText}: ${generatedLink}`;
    setPostPreview(preview);
  };

  const postToTwitter = async () => {
    if (!postPreview) {
      toast.error('Please build a post first');
      return;
    }

    setIsPosting(true);
    try {
      // In a real implementation, this would call the Twitter API via tRPC
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postPreview)}`;
      window.open(twitterUrl, '_blank');
      
      onPostCreated?.('post-' + Date.now(), generatedLink);
      toast.success('Post opened in Twitter!');
      
      // Reset form
      setPostText('');
      setPaymentAmount('');
      setGeneratedLink('');
      setPostPreview('');
      setShowPostBuilder(false);
    } catch (error) {
      toast.error('Failed to post to Twitter');
    } finally {
      setIsPosting(false);
    }
  };

  const copyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="space-y-4">
      {/* Twitter Account Info */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Twitter className="w-8 h-8" />
            <div>
              <p className="text-blue-200 text-sm">Connected Account</p>
              <p className="text-lg font-bold">@{twitterHandle}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post Builder Toggle */}
      <Button
        onClick={() => setShowPostBuilder(!showPostBuilder)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
      >
        <Send className="w-4 h-4 mr-2" />
        {showPostBuilder ? 'Close Post Builder' : 'Create Payment Post'}
      </Button>

      {/* Post Builder */}
      {showPostBuilder && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Create Payment Post</CardTitle>
            <CardDescription>Build a post with a payment link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Post Text */}
            <div className="space-y-2">
              <Label htmlFor="post-text" className="text-white">
                Post Text
              </Label>
              <textarea
                id="post-text"
                placeholder="What do you want to share with your followers?"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 min-h-24"
              />
              <p className="text-gray-400 text-xs">{postText.length}/280 characters</p>
            </div>

            {/* Payment Amount */}
            <div className="space-y-2">
              <Label htmlFor="payment-amount" className="text-white">
                Suggested Payment Amount (USD)
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-white">$</span>
                <Input
                  id="payment-amount"
                  type="number"
                  placeholder="5.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            {/* Link Text */}
            <div className="space-y-2">
              <Label htmlFor="link-text" className="text-white">
                Link Text
              </Label>
              <Input
                id="link-text"
                type="text"
                placeholder="Support me"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            {/* Generate Link Button */}
            <Button
              onClick={generatePaymentLink}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Generate Payment Link
            </Button>

            {/* Generated Link Display */}
            {generatedLink && (
              <div className="space-y-2">
                <div className="bg-slate-700 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-2">Payment Link</p>
                  <code className="text-gray-300 text-sm break-all">{generatedLink}</code>
                </div>
                <Button
                  onClick={copyLink}
                  variant="outline"
                  className="w-full text-white border-slate-600 hover:bg-slate-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            )}

            {/* Build Post Button */}
            <Button
              onClick={buildPost}
              disabled={!postText || !generatedLink}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Build Post Preview
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Post Preview */}
      {postPreview && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Post Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preview Box */}
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white font-bold">@{twitterHandle}</p>
                  <p className="text-gray-300 text-sm mt-2 whitespace-pre-wrap">{postPreview}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => setPostPreview('')}
                variant="outline"
                className="text-white border-slate-600 hover:bg-slate-700"
              >
                Edit
              </Button>
              <Button
                onClick={postToTwitter}
                disabled={isPosting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Twitter className="w-4 h-4 mr-2" />
                {isPosting ? 'Posting...' : 'Post to X'}
              </Button>
            </div>

            {/* Info */}
            <div className="bg-slate-700 rounded-lg p-3 text-sm text-gray-300 space-y-1">
              <p>• Post will open in a new Twitter window</p>
              <p>• You can edit before posting</p>
              <p>• Payment link is trackable</p>
              <p>• Followers can tip directly from the link</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Tips for Success</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-300 space-y-2">
          <p>• Be clear about what supporters are funding</p>
          <p>• Use engaging language and emojis</p>
          <p>• Share payment links during peak engagement times</p>
          <p>• Thank supporters publicly for credibility</p>
          <p>• Track which posts generate the most tips</p>
        </CardContent>
      </Card>
    </div>
  );
}
