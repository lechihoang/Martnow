'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Edit, Trash2, Send } from 'lucide-react';
import { blogApi } from '../lib/api';
import { BlogCommentDto } from '../types/dtos';

interface CommentSectionProps {
  blogId: number;
  userProfile: any;
}

interface CommentItemProps {
  comment: BlogCommentDto;
  blogId: number;
  onUpdate: () => void;
  userProfile: any;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onUpdate,
  userProfile
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const isDeleted = comment.deletedAt !== null && comment.deletedAt !== undefined;

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

  const isAuthor = userProfile?.id?.toString() === comment.user.id?.toString();

  return (
    <div className="mb-6 border-l-2 border-gray-100 pl-4">
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

          {isAuthor && !isDeleted && (
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

        {isEditing && !isDeleted ? (
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
            <p className={`mb-2 ${isDeleted ? 'text-gray-400 italic' : 'text-gray-700'}`}>
              {comment.content}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

const CommentSection: React.FC<CommentSectionProps> = ({ blogId, userProfile }) => {
  const [comments, setComments] = useState<BlogCommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await blogApi.getBlogComments(blogId);
      // All comments are now top-level (no hierarchical structure)
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userProfile) return;

    try {
      setSubmitting(true);
      await blogApi.createBlogComment(blogId, {
        content: newComment,
      });

      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Error creating comment:', err);
      alert('Không thể thêm bình luận');
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded"></div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      {/* Comment Form */}
      {userProfile ? (
        <form onSubmit={handleSubmitComment} className="mb-12">
          <div className="flex space-x-4">
            <textarea
              id="comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Chia sẻ suy nghĩ của bạn..."
              className="flex-1 p-4 border-2 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
              rows={4}
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Send size={18} />
                  <span>Gửi</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-12 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-blue-600 text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Đăng nhập để bình luận</h3>
          <p className="text-gray-600 mb-4">Tham gia thảo luận và chia sẻ ý kiến của bạn với cộng đồng</p>
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Đăng nhập ngay
          </button>
        </div>
      )}

      {/* Comments List */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <span>💬</span>
          <span>Bình luận ({comments.length})</span>
        </h3>
        
        {comments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <MessageCircle size={48} className="text-gray-300" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Chưa có bình luận nào</h4>
            <p className="text-gray-600 mb-4">Hãy là người đầu tiên bắt đầu cuộc trò chuyện!</p>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              🚀 Viết bình luận đầu tiên
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                blogId={blogId}
                onUpdate={fetchComments}
                userProfile={userProfile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
