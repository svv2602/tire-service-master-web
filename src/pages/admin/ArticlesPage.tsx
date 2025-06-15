import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Pagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useGetArticlesQuery, useDeleteArticleMutation } from '../../api/articles.api';
// import { Article } from '../../types/models'; // Убираем неиспользуемый импорт
import { ArticleSummary, ARTICLE_STATUS_LABELS, ARTICLE_CATEGORIES } from '../../types/articles';
import ArticleForm from '../../components/articles/ArticleForm';
import { formatDate } from '../../utils/dateUtils';

// ... existing code ... 