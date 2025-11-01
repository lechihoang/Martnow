'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Edit, Trash2, Send } from 'lucide-react';
import { blogApi } from '../lib/api';
import { BlogCommentDto } from '../types/dtos';
import { UserProfile } from '@/types/auth';
import SimpleCommentEditor from './SimpleCommentEditor';
import toast from 'react-hot-toast';
import { ConfirmDialog } from './ui';
import { useAuthContext } from '../contexts/AuthContext';

interface CommentSectionProps {
  blogId: number;
  userProfile: UserProfile | null;
  profileLoading?: boolean;
}

interface CommentItemProps {
  comment: BlogCommentDto;
  blogId: number;
  onUpdate: () => void;
  userProfile: UserProfile | null;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onUpdate,
  userProfile
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isDeleted = comment.deletedAt !== null && comment.deletedAt !== undefined;

  const handleEdit = async () => {
    try {
      await blogApi.updateComment(comment.id, { content: editContent });
      setIsEditing(false);
      toast.success('Đã cập nhật bình luận');
      onUpdate();
    } catch (err) {
      console.error('Error updating comment:', err);
      toast.error('Không thể cập nhật bình luận');
    }
  };

  const handleDelete = async () => {
    try {
      await blogApi.deleteComment(comment.id);
      toast.success('Đã xóa bình luận');
      onUpdate();
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('Không thể xóa bình luận');
    } finally {
      setConfirmDelete(false);
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
                className="p-1 text-gray-400 hover:text-emerald-600 transition-colors"
                title="Chỉnh sửa"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
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
            <SimpleCommentEditor
              content={editContent}
              onChange={(content) => setEditContent(content)}
              placeholder="Chỉnh sửa bình luận..."
            />
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700"
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
            <p className={`whitespace-pre-wrap ${isDeleted ? 'text-gray-400 italic' : 'text-gray-700'}`}>
              {comment.content}
            </p>
          </>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Xóa bình luận"
        message="Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
};

const CommentSection: React.FC<CommentSectionProps> = ({ blogId, userProfile, profileLoading = false }) => {
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
      toast.success('Đã thêm bình luận');
      fetchComments();
    } catch (err) {
      console.error('Error creating comment:', err);
      toast.error('Không thể thêm bình luận');
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
      {profileLoading ? (
        <div className="mb-12 animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg ml-auto"></div>
        </div>
      ) : userProfile ? (
        <form onSubmit={handleSubmitComment} className="mb-12">
          <div className="space-y-4">
            <SimpleCommentEditor
              content={newComment}
              onChange={(content) => setNewComment(content)}
              placeholder="Chia sẻ suy nghĩ của bạn..."
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Send size={18} />
                    <span>Gửi bình luận</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-12 p-8 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border-2 border-dashed border-emerald-200 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-emerald-600 text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Đăng nhập để bình luận</h3>
          <p className="text-gray-600 mb-4">Tham gia thảo luận và chia sẻ ý kiến của bạn với cộng đồng</p>
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
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
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium">
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
