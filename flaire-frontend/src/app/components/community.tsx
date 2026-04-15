import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface CommunityPost {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export function Community() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');

  const loadPosts = async () => {
    try {
      const res = await api.getCommunityPosts();
      setPosts(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load community posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      const created = await api.createCommunityPost({
        author: author.trim() || 'Anonymous',
        content,
      });

      setPosts((prev) => [created, ...prev]);
      setAuthor('');
      setContent('');
    } catch (err) {
      console.error('Failed to create post:', err);
      alert('Failed to add post');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteCommunityPost(id);
      setPosts((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Failed to delete post');
    }
  };

  if (loading) {
    return <div className="p-4">Loading community...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Community</h2>

        <form onSubmit={handleAddPost} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Name</label>
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Share something</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a supportive thought, question, or experience..."
              className="w-full min-h-[120px] rounded-md border px-3 py-2"
            />
          </div>

          <Button type="submit" style={{ backgroundColor: '#7293BB' }} className="text-white">
            Post
          </Button>
        </form>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Recent Posts</h3>

        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-lg border p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <h4 className="font-semibold">{post.author}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm mt-3 whitespace-pre-wrap">{post.content}</p>
                </div>

                <Button variant="outline" onClick={() => handleDelete(post.id)}>
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}