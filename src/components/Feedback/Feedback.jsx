// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import Swal from 'sweetalert2';
// import { auth, db, storage } from '../Firebase/FirebaseConfig';
// import { onAuthStateChanged } from 'firebase/auth';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import axios from 'axios';
// import { FaChevronLeft } from 'react-icons/fa';
// import './Feedback.css';

// const EMOJI_RATINGS = [
//   { emoji: '☹️', label: 'Very Dissatisfied', value: 1 },
//   { emoji: '😐', label: 'Neutral', value: 2 },
//   { emoji: '🙂', label: 'Satisfied', value: 3 },
//   { emoji: '😊', label: 'Happy', value: 4 },
//   { emoji: '😄', label: 'Very Happy', value: 5 },
// ];

// const SUGGESTIONS = [
//   "Great service",
//   "Delicious food",
//   "Good value for money",
//   "Quick service",
//   "Needs improvement",
//   "Outstanding experience"
// ];

// const BRANCHES = [
//   "Hogis Royale and Apartments",
//   "Hogis Luxury Suites",
//   "Hogis Exclusive Suites",
// ];

// const useFeedbackForm = () => {
//   const [rating, setRating] = useState(null);
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [comment, setComment] = useState('');
//   const [selectedBranch, setSelectedBranch] = useState('');
//   const [selectedSuggestions, setSelectedSuggestions] = useState([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [photos, setPhotos] = useState([]);

//   const validateForm = () => {
//     const errors = [];
//     if (rating === null) errors.push('Please provide a reaction');
//     if (name.trim() === '') errors.push('Please provide your name');
//     if (comment.trim() === '') errors.push('Please provide a comment');
//     if (!selectedBranch) errors.push('Please select a branch');
//     if (email && !/\S+@\S+\.\S+/.test(email)) errors.push('Please provide a valid email');
//     return errors;
//   };

//   const handlePhotoCapture = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       if (photos.length < 3) {
//         setPhotos(prevPhotos => [...prevPhotos, e.target.files[0]]);
//       } else {
//         Swal.fire({
//           title: 'Maximum Photos Reached',
//           text: 'You can only upload up to 3 photos.',
//           icon: 'warning',
//         });
//       }
//     }
//   };

//   const removePhoto = (index) => {
//     setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const errors = validateForm();
    
//     if (errors.length > 0) {
//       Swal.fire({
//         title: 'Oops!',
//         html: errors.join('<br>'),
//         icon: 'error',
//       });
//       return;
//     }

//     setIsSubmitting(true);
    
//     let photoURLs = [];
//     for (let photo of photos) {
//       const photoRef = ref(storage, `feedback-photos/${Date.now()}-${photo.name}`);
//       await uploadBytes(photoRef, photo);
//       const url = await getDownloadURL(photoRef);
//       photoURLs.push(url);
//     }

//     const feedbackData = {
//       rating,
//       name,
//       email,
//       comment,
//       branch: selectedBranch,
//       suggestions: selectedSuggestions,
//       createdAt: serverTimestamp(),
//       photoURLs,
//     };

//     try {
//       await addDoc(collection(db, 'feedbacks'), feedbackData);
      
//       // Send email notifications
//       await axios.post('/.netlify/functions/send-feedback-notification', feedbackData);
      
//       Swal.fire({
//         title: 'Thank you!',
//         text: 'Your feedback has been submitted successfully.',
//         icon: 'success',
//       });
//       // Reset form
//       setRating(null);
//       setName('');
//       setEmail('');
//       setComment('');
//       setSelectedBranch('');
//       setSelectedSuggestions([]);
//       setPhotos([]);
//     } catch (error) {
//       console.error("Error submitting feedback: ", error);
//       Swal.fire({
//         title: 'Error!',
//         text: 'Failed to submit feedback. Please try again.',
//         icon: 'error',
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return {
//     rating,
//     setRating,
//     name,
//     setName,
//     email,
//     setEmail,
//     comment,
//     setComment,
//     selectedBranch,
//     setSelectedBranch,
//     selectedSuggestions,
//     setSelectedSuggestions,
//     isSubmitting,
//     handleSubmit,
//     photos,
//     handlePhotoCapture,
//     removePhoto
//   };
// };

// const EmojiRating = ({ rating, setRating }) => {
//   return (
//     <div className="custom-emoji-rating" role="group" aria-label="Rate your experience">
//       {EMOJI_RATINGS.map((emojiRating) => (
//         <button
//           key={emojiRating.value}
//           type="button"
//           onClick={() => setRating(emojiRating.value)}
//           className={`custom-emoji-button ${rating === emojiRating.value ? 'selected' : ''}`}
//           aria-label={emojiRating.label}
//           title={emojiRating.label}
//         >
//           {emojiRating.emoji}
//         </button>
//       ))}
//     </div>
//   );
// };

// const SuggestionButtons = ({ setComment, selectedSuggestions, setSelectedSuggestions }) => {
//   const handleSuggestionClick = (suggestion) => {
//     setSelectedSuggestions(prev => {
//       const newSelected = prev.includes(suggestion)
//         ? prev.filter(s => s !== suggestion)
//         : [...prev, suggestion];
      
//       setComment(newSelected.join(', '));
//       return newSelected;
//     });
//   };

//   return (
//     <div className="custom-suggestion-buttons">
//       {SUGGESTIONS.map((suggestion, index) => (
//         <button
//           key={index}
//           type="button"
//           onClick={() => handleSuggestionClick(suggestion)}
//           className={`custom-suggestion-button ${selectedSuggestions.includes(suggestion) ? 'selected' : ''}`}
//         >
//           {suggestion}
//         </button>
//       ))}
//     </div>
//   );
// };

// const FeedbackForm = () => {
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   const {
//     rating,
//     setRating,
//     name,
//     setName,
//     email,
//     setEmail,
//     comment,
//     setComment,
//     selectedBranch,
//     setSelectedBranch,
//     selectedSuggestions,
//     setSelectedSuggestions,
//     isSubmitting,
//     handleSubmit,
//     photos,
//     handlePhotoCapture,
//     removePhoto
//   } = useFeedbackForm();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       if (currentUser) {
//         setUser(currentUser);
//         setName(currentUser.displayName || '');
//         setEmail(currentUser.email || '');
//       } else {
//         setUser(null);
//         showLoginAlert();
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   const showLoginAlert = () => {
//     Swal.fire({
//       title: 'Login Required',
//       text: 'Please sign in or log in to access the feedback form.',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Go to Login',
//       cancelButtonText: 'Cancel'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         navigate('/login');
//       } else {
//         navigate('/menu');
//       }
//     });
//   };

//   if (!user) {
//     return null;
//   }

//   return (
//     <div className="custom-feedback-page">
//       <nav className="custom-breadcrumb bg-[#f2f4f6]">
//         <Link to="/menu" className="custom-back-to-menu ">
//           <FaChevronLeft className="custom-back-icon  text-black" />
//         </Link>
//       </nav>
//       <div className="custom-feedback-wrapper">
//         <div className="custom-feedback-container">
//           <div className="custom-feedback-header">
//             <img src="/Hogis Group Logo 2.jpg" alt="Hogis Logo" className="custom-feedback-logo" />
//             <h2 className="custom-feedback-title">We'd love your feedback!👍🏼</h2>
//           </div>
//           <form onSubmit={handleSubmit}>
//             <div className="custom-form-group">
//               <label htmlFor="branch" className="custom-form-label">Select Branch:</label>
//               <select
//                 id="branch"
//                 value={selectedBranch}
//                 onChange={(e) => setSelectedBranch(e.target.value)}
//                 className="custom-form-input"
//                 required
//               >
//                 <option value="">Select a branch</option>
//                 {BRANCHES.map((branch) => (
//                   <option key={branch} value={branch}>
//                     {branch}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="custom-form-group">
//               <label className="custom-form-label">How was your experience?</label>
//               <EmojiRating rating={rating} setRating={setRating} />
//             </div>
//             <div className="custom-form-group">
//               <label className="custom-form-label">Quick suggestions:</label>
//               <SuggestionButtons 
//                 setComment={setComment} 
//                 selectedSuggestions={selectedSuggestions}
//                 setSelectedSuggestions={setSelectedSuggestions}
//               />
//             </div>
//             <div className="custom-form-group">
//               <label htmlFor="name" className="custom-form-label">Name:</label>
//               <input
//                 type="text"
//                 id="name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="Your Name"
//                 className="custom-form-input"
//               />
//             </div>
//             <div className="custom-form-group">
//               <label htmlFor="email" className="custom-form-label">Email (optional):</label>
//               <input
//                 type="email"
//                 id="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="your@email.com"
//                 className="custom-form-input"
//               />
//             </div>
//             <div className="custom-form-group">
//               <label htmlFor="comment" className="custom-form-label">Comments:</label>
//               <textarea
//                 id="comment"
//                 value={comment}
//                 onChange={(e) => setComment(e.target.value)}
//                 placeholder="Tell us about your experience..."
//                 required
//                 className="custom-form-input custom-form-textarea"
//               />
//             </div>
//             <div className="custom-form-group">
//               <label htmlFor="photo" className="custom-form-label">Take a photo (optional):</label>
//               <input
//                 type="file"
//                 id="photo"
//                 accept="image/*"
//                 capture="environment"
//                 onChange={handlePhotoCapture}
//                 className="custom-form-input custom-file-input"
//               />
//               <label htmlFor="photo" className="custom-file-label">
//                 {photos.length < 5 ? 'Take a Photo 📸' : 'Maximum Photos Reached'}
//               </label>
//             </div>
//             {photos.length > 0 && (
//               <div className="custom-form-group custom-photo-preview">
//                 {photos.map((photo, index) => (
//                   <div key={index} className="custom-photo-item">
//                     <img src={URL.createObjectURL(photo)} alt={`Captured ${index + 1}`} className="custom-photo-thumbnail" />
//                     <button type="button" onClick={() => removePhoto(index)} className="custom-photo-remove">Remove</button>
//                   </div>
//                 ))}
//               </div>
//             )}
//             <button type="submit" disabled={isSubmitting} className="custom-submit-button">
//               {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FeedbackForm;


import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, CameraIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import { auth, db, storage } from '../Firebase/FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import axios from 'axios';

const REACTIONS = [
  { label: 'Negative', value: 1, color: 'bg-red-500' },
  { label: 'Neutral', value: 2, color: 'bg-gray-500' },
  { label: 'Positive', value: 3, color: 'bg-green-500' },
];

const SUGGESTIONS = [
  "Great service",
  "Delicious food",
  "Good value for money",
 
];

const BRANCHES = [
  "Hogis Royale and Apartments",
  "Hogis Luxury Suites",
  "Hogis Exclusive Suites",
];

const FeedbackForm = () => {
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.displayName || '');
        setEmail(currentUser.email || '');
      } else {
        setUser(null);
        showLoginAlert();
      }
    });

    return () => unsubscribe();
  }, []);

  const showLoginAlert = () => {
    Swal.fire({
      title: 'Login Required',
      text: 'Please sign in or log in to access the feedback form.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Go to Login',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/login');
      } else {
        navigate('/menu');
      }
    });
  };

  const validateForm = () => {
    const errors = [];
    if (rating === null) errors.push('Please provide a reaction');
    if (name.trim() === '') errors.push('Please provide your name');
    if (comment.trim() === '') errors.push('Please provide a comment');
    if (!selectedBranch) errors.push('Please select a branch');
    if (email && !/\S+@\S+\.\S+/.test(email)) errors.push('Please provide a valid email');
    if (phone && !/^\+?[\d\s-]{10,}$/.test(phone)) errors.push('Please provide a valid phone number');
    return errors;
  };

  const handlePhotoCapture = (e) => {
    if (e.target.files && e.target.files[0]) {
      if (photos.length < 3) {
        setPhotos(prevPhotos => [...prevPhotos, e.target.files[0]]);
      } else {
        Swal.fire({
          title: 'Maximum Photos Reached',
          text: 'You can only upload up to 3 photos.',
          icon: 'warning',
        });
      }
    }
  };

  const removePhoto = (index) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (errors.length > 0) {
      Swal.fire({
        title: 'Oops!',
        html: errors.join('<br>'),
        icon: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    
    let photoURLs = [];
    for (let photo of photos) {
      const photoRef = ref(storage, `feedback-photos/${Date.now()}-${photo.name}`);
      await uploadBytes(photoRef, photo);
      const url = await getDownloadURL(photoRef);
      photoURLs.push(url);
    }

    const feedbackData = {
      rating,
      name,
      email,
      phone,
      comment,
      branch: selectedBranch,
      suggestions: selectedSuggestions,
      createdAt: serverTimestamp(),
      photoURLs,
    };

    try {
      await addDoc(collection(db, 'feedbacks'), feedbackData);
      
      // Send email notifications
      await axios.post('/.netlify/functions/send-feedback-notification', feedbackData);
      
      Swal.fire({
        title: 'Thank you!',
        text: 'Your feedback has been submitted successfully.',
        icon: 'success',
      });
      // Reset form
      setRating(null);
      setName('');
      setEmail('');
      setPhone('');
      setComment('');
      setSelectedBranch('');
      setSelectedSuggestions([]);
      setPhotos([]);
    } catch (error) {
      console.error("Error submitting feedback: ", error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to submit feedback. Please try again.',
        icon: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSelectedSuggestions(prev => {
      const newSelected = prev.includes(suggestion)
        ? prev.filter(s => s !== suggestion)
        : [...prev, suggestion];
      
      setComment(newSelected.join(', '));
      return newSelected;
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white min-h-screen max-w-md mx-auto p-4 text-sm">
      <nav className="flex items-center mb-4">
        <Link to="/menu" className="text-gray-600">
          <ChevronLeftIcon className="w-6 h-6" />
        </Link>
        <h1 className="text-lg text-black font-semibold ml-4">Feedback</h1>
      </nav>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Select Branch</label>
          <select 
            value={selectedBranch} 
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full p-2 border rounded text-sm"
          >
            <option value="">Select a branch</option>
            {BRANCHES.map((branch) => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">How was your experience?</label>
          <div className="flex justify-between space-x-2">
            {REACTIONS.map((reaction) => (
              <button
                key={reaction.value}
                type="button"
                onClick={() => setRating(reaction.value)}
                className={`flex-1 p-2 rounded text-white text-sm ${
                  rating === reaction.value ? `${reaction.color} opacity-100` : 'bg-gray-300'
                }`}
              >
                {reaction.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Quick Suggestions</label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`px-2 py-1 rounded text-xs ${
                  selectedSuggestions.includes(suggestion) 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="w-full p-2 border rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Email (Optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full p-2 border rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Phone (Optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234904675483"
            className="w-full p-2 border rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Comments</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience..."
            className="w-full p-2 border rounded text-sm h-24"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Upload Photo</label>
          <input
            type="file"
            id="photo"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
          />
          <label 
            htmlFor="photo" 
            className="w-full p-2 border rounded text-sm text-center block bg-gray-100 cursor-pointer"
          >
            Take a Photo
          </label>
        </div>

        {photos.length > 0 && (
          <div className="flex space-x-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                <img 
                  src={URL.createObjectURL(photo)} 
                  alt={`Captured ${index + 1}`} 
                  className="w-20 h-20 object-cover rounded"
                />
                <button 
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full p-3 bg-gradient-to-r from-[#AF6E1C] to-[#C49402] text-white rounded text-sm hover:bg-gradient-to-r from-[#AF6E1C] to-[#C49408] disabled:bg-gradient-to-r from-[#AF6E1C] to-[#C49404]"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>
    </div>
  );
};

export default FeedbackForm;