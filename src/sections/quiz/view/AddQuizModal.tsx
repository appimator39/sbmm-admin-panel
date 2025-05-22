import { useState, useEffect } from 'react';
import { format } from 'date-fns';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete from '@mui/material/Autocomplete';
import FormHelperText from '@mui/material/FormHelperText';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { Iconify } from 'src/components/iconify';
import httpService from 'src/services/httpService';
import { useBatches } from 'src/hooks/use-batches';

// ----------------------------------------------------------------------

interface Topic {
  _id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface AddQuizModalProps {
  open: boolean;
  onClose: VoidFunction;
  onQuizAdded: VoidFunction;
}

interface FormErrors {
  title?: string;
  topic?: string;
  batches?: string;
  totalMarks?: string;
  passingMarks?: string;
  lastDateToSubmit?: string;
  questions?: string;
}

export function AddQuizModal({ open, onClose, onQuizAdded }: AddQuizModalProps) {
  const [title, setTitle] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const { batches } = useBatches(0, 100);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedBatches, setSelectedBatches] = useState<typeof batches[0][]>([]);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [isCreatingTopicLoading, setIsCreatingTopicLoading] = useState(false);
  const [totalMarks, setTotalMarks] = useState('');
  const [passingMarks, setPassingMarks] = useState('');
  const [lastDateToSubmit, setLastDateToSubmit] = useState<Date | null>(null);
  const [questions, setQuestions] = useState([
    {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
    },
  ]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await httpService.get<Topic[]>('/quiz/topics');
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!selectedTopic) {
      newErrors.topic = 'Please select or create a topic';
    }

    if (selectedBatches.length === 0) {
      newErrors.batches = 'Please select at least one batch';
    }

    if (!totalMarks || parseInt(totalMarks, 10) <= 0) {
      newErrors.totalMarks = 'Total marks must be greater than 0';
    }

    if (!passingMarks || parseInt(passingMarks, 10) <= 0) {
      newErrors.passingMarks = 'Passing marks must be greater than 0';
    }

    if (parseInt(passingMarks, 10) > parseInt(totalMarks, 10)) {
      newErrors.passingMarks = 'Passing marks cannot be greater than total marks';
    }

    if (!lastDateToSubmit) {
      newErrors.lastDateToSubmit = 'Last date to submit is required';
    } else if (lastDateToSubmit < new Date()) {
      newErrors.lastDateToSubmit = 'Last date cannot be in the past';
    }

    const hasEmptyQuestions = questions.some(
      (q) => !q.question.trim() || q.options.some((opt) => !opt.trim())
    );
    if (hasEmptyQuestions) {
      newErrors.questions = 'All questions and options must be filled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
      },
    ]);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex: number, value: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswer = value;
    setQuestions(newQuestions);
  };

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) {
      setErrors(prev => ({ ...prev, topic: 'Topic name is required' }));
      return;
    }

    setIsCreatingTopicLoading(true);
    setErrors(prev => ({ ...prev, topic: undefined }));
    
    try {
      const response = await httpService.post<Topic>('/quiz/admin/create-topic', {
        name: newTopicName,
        description: newTopicDescription,
      });

      // Access the topic data directly from response.data
      const newTopic = response.data;
      
      // Update topics list with the new topic
      setTopics(prevTopics => {
        // Check if topic already exists to avoid duplicates
        const exists = prevTopics.some(topic => topic._id === newTopic._id);
        if (exists) {
          return prevTopics;
        }
        return [...prevTopics, newTopic];
      });

      // Select the newly created topic
      setSelectedTopic(newTopic);
      
      // Reset form and close topic creation
      setIsCreatingTopic(false);
      setNewTopicName('');
      setNewTopicDescription('');
      
      // Clear any errors
      setErrors(prev => ({ ...prev, topic: undefined }));
    } catch (error: any) {
      console.error('Error creating topic:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create topic';
      setErrors(prev => ({ ...prev, topic: errorMessage }));
    } finally {
      setIsCreatingTopicLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitError('');
    
    if (!validateForm()) {
      return;
    }

    try {
      await httpService.post('/quiz/admin/create', {
        title,
        topicId: selectedTopic?._id,
        batchIds: selectedBatches.map(batch => batch._id),
        totalMarks: parseInt(totalMarks, 10),
        passingMarks: parseInt(passingMarks, 10),
        lastDateToSubmit: lastDateToSubmit?.toISOString(),
        questions,
      });

      onQuizAdded();
      onClose();
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Failed to create quiz');
      console.error('Error creating quiz:', error);
    }
  };

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle>Create New Quiz</DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
          />

          {!isCreatingTopic ? (
            <Stack direction="row" spacing={2}>
              <Autocomplete
                fullWidth
                options={topics}
                getOptionLabel={(option) => option?.name || ''}
                value={selectedTopic}
                onChange={(_, newValue) => {
                  setSelectedTopic(newValue);
                  setErrors(prev => ({ ...prev, topic: undefined }));
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Select Topic" 
                    error={!!errors.topic}
                    helperText={errors.topic}
                  />
                )}
                isOptionEqualToValue={(option, value) => {
                  if (!option || !value) return false;
                  return option._id === value._id;
                }}
                renderOption={(props, option) => (
                  <li {...props} key={option._id}>
                    <Box>
                      <Typography variant="body1">{option.name}</Typography>
                      {option.description && (
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      )}
                    </Box>
                  </li>
                )}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  setIsCreatingTopic(true);
                  setErrors(prev => ({ ...prev, topic: undefined }));
                }}
                sx={{ minWidth: 120 }}
              >
                New Topic
              </Button>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Topic Name"
                value={newTopicName}
                onChange={(e) => {
                  setNewTopicName(e.target.value);
                  setErrors(prev => ({ ...prev, topic: undefined }));
                }}
                error={!!errors.topic}
                helperText={errors.topic}
                disabled={isCreatingTopicLoading}
              />
              <TextField
                fullWidth
                label="Topic Description"
                multiline
                rows={2}
                value={newTopicDescription}
                onChange={(e) => setNewTopicDescription(e.target.value)}
                disabled={isCreatingTopicLoading}
              />
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsCreatingTopic(false);
                    setErrors(prev => ({ ...prev, topic: undefined }));
                  }}
                  sx={{ flex: 1 }}
                  disabled={isCreatingTopicLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCreateTopic}
                  sx={{ flex: 1 }}
                  disabled={isCreatingTopicLoading}
                  startIcon={isCreatingTopicLoading ? <CircularProgress size={20} /> : null}
                >
                  {isCreatingTopicLoading ? 'Creating...' : 'Create Topic'}
                </Button>
              </Stack>
            </Stack>
          )}

          <Autocomplete
            multiple
            options={batches}
            getOptionLabel={(option) => option?.title || ''}
            value={selectedBatches}
            onChange={(_, newValue) => setSelectedBatches(newValue)}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Select Batches" 
                error={!!errors.batches}
                helperText={errors.batches}
              />
            )}
            isOptionEqualToValue={(option, value) => option._id === value._id}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Total Marks"
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              error={!!errors.totalMarks}
              helperText={errors.totalMarks}
            />

            <TextField
              fullWidth
              label="Passing Marks"
              type="number"
              value={passingMarks}
              onChange={(e) => setPassingMarks(e.target.value)}
              error={!!errors.passingMarks}
              helperText={errors.passingMarks}
            />
          </Stack>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Last Date to Submit"
              value={lastDateToSubmit}
              onChange={(newValue) => setLastDateToSubmit(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.lastDateToSubmit,
                  helperText: errors.lastDateToSubmit,
                },
              }}
            />
          </LocalizationProvider>

          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3,
              color: 'text.primary',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Iconify icon="solar:document-text-bold" width={24} />
            Questions
            {errors.questions && (
              <FormHelperText error sx={{ ml: 2 }}>
                {errors.questions}
              </FormHelperText>
            )}
          </Typography>

          {questions.map((question, questionIndex) => (
            <Box 
              key={questionIndex} 
              sx={{ 
                p: 3, 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 2,
                mb: 3,
                bgcolor: 'background.paper',
                boxShadow: (theme) => theme.customShadows?.z8,
                '&:hover': {
                  boxShadow: (theme) => theme.customShadows?.z16,
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Stack spacing={3}>
                <Box>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      mb: 1.5, 
                      color: 'text.primary',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                      }}
                    >
                      {questionIndex + 1}
                    </Box>
                    Question {questionIndex + 1}
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter your question here..."
                    value={question.question}
                    onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                    multiline
                    rows={2}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.neutral',
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      mb: 1.5, 
                      color: 'text.secondary',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Iconify icon="solar:list-bold" width={20} />
                    Options
                  </Typography>
                  <Stack spacing={2}>
                    {question.options.map((option, optionIndex) => (
                      <TextField
                        key={optionIndex}
                        fullWidth
                        placeholder={`Option ${optionIndex + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Box
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 1,
                                  border: '2px solid',
                                  borderColor: question.correctAnswer === optionIndex ? 'primary.main' : 'divider',
                                  bgcolor: question.correctAnswer === optionIndex ? 'primary.main' : 'transparent',
                                  color: question.correctAnswer === optionIndex ? 'primary.contrastText' : 'text.secondary',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 1,
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                  transition: 'all 0.2s ease-in-out',
                                }}
                              >
                                {String.fromCharCode(65 + optionIndex)}
                              </Box>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'background.neutral',
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                <Box>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      mb: 1.5, 
                      color: 'text.secondary',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Iconify icon="solar:check-circle-bold" width={20} />
                    Correct Answer
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    value={question.correctAnswer}
                    onChange={(e) => handleCorrectAnswerChange(questionIndex, Number(e.target.value))}
                    SelectProps={{
                      native: false,
                      sx: {
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                        },
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.neutral',
                      },
                    }}
                  >
                    {question.options.map((_, index) => (
                      <MenuItem 
                        key={index} 
                        value={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          py: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: 1,
                            border: '2px solid',
                            borderColor: 'primary.main',
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                          }}
                        >
                          {String.fromCharCode(65 + index)}
                        </Box>
                        Option {index + 1}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Stack>
            </Box>
          ))}

          <Button
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleAddQuestion}
            variant="outlined"
            sx={{ 
              mt: 2,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                bgcolor: 'primary.lighter',
              },
            }}
          >
            Add Question
          </Button>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>

        <Button variant="contained" onClick={handleSubmit}>
          Create Quiz
        </Button>
      </DialogActions>
    </Dialog>
  );
} 