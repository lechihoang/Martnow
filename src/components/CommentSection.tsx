'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Reply, Edit, Trash2, Send } from 'lucide-react';
import { blogApi } from '../lib/api';
import useUser from '../hooks/useUser';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
  };
  parentId?: number;
  replies: Comment[];
}

interface CommentSectionProps {
  blogId: number;
}

interface CommentItemProps {
  comment: Comment;
  blogId: number;
  onReply: (parentId: number) => void;
  onUpdate: () => void;
  level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  blogId, 
  onReply, 
  onUpdate, 
  level = 0 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const { user } = useUser();

  const handleEdit = async () => {
    try {
      await blogApi.updateComment(comment.id, { content: editContent });
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      console.error('Error updating comment:', err);
      alert('Không thể cập nhật bình luận');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

    try {
      await blogApi.deleteComment(comment.id);
      onUpdate();
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Không thể xóa bình luận');
    }
  };

  const isAuthor = user?.id === comment.user.id;
  const canReply = level < 2; // Chỉ cho phép reply 2 cấp

  return (
    <div className={`${level > 0 ? 'ml-8 mt-4' : 'mb-6'} border-l-2 border-gray-100 pl-4`}>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{comment.user.name}</span>
            <span className="text-sm text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
            </span>
            {comment.createdAt !== comment.updatedAt && (
              <span className="text-xs text-gray-400">(đã chỉnh sửa)</span>
            )}
          </div>

          {isAuthor && (
            <div className="flex space-x-1">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Chỉnh sửa"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Xóa"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Lưu
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-700 mb-2">{comment.content}</p>
            {canReply && user && (
              <button
                onClick={() => onReply(comment.id)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <Reply size={14} className="mr-1" />
                Trả lời
              </button>
            )}
          </>
        )}
      </div>

      {/* Replies */}
      {comment.replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          blogId={blogId}
          onReply={onReply}
          onUpdate={onUpdate}
          level={level + 1}
        />
      ))}
    </div>
  );
};

const CommentSection: React.FC<CommentSectionProps> = ({ blogId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await blogApi.getComments(blogId);
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      setSubmitting(true);
      await blogApi.createComment(blogId, {
        content: newComment,
        parentId: replyToId || undefined,
      });
      
      setNewComment('');
      setReplyToId(null);
      fetchComments();
    } catch (err) {
      console.error('Error creating comment:', err);
      alert('Không thể thêm bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (parentId: number) => {
    setReplyToId(parentId);
    document.getElementById('comment-input')?.focus();
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded"></div>;
  }

  return (
    <div>
      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          {replyToId && (
            <div className="mb-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
              <span className="text-sm text-blue-700">Đang trả lời bình luận</span>
              <button
                type="button"
                onClick={() => setReplyToId(null)}
                className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Hủy
              </button>
            </div>
          )}
          <div className="flex space-x-3">
            <textarea
              id="comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyToId ? 'Viết câu trả lời...' : 'Viết bình luận...'}
              className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-600 mb-2">Đăng nhập để bình luận</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Đăng nhập
          </button>
        </div>
      )}

      {/* Comments List */}
      <div>
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-2 text-gray-300" />
            <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              blogId={blogId}
              onReply={handleReply}
              onUpdate={fetchComments}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
