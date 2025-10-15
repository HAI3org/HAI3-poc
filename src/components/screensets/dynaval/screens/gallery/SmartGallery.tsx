import React, { useState, useEffect } from 'react';
import { Calendar, Users, Tag, Search, Filter, Grid, List, ChevronDown, User, Car, Camera, Home, Coffee, Mountain, Dog, Pizza, Edit2, X, Trash2, Upload, Image as ImageIcon, Plus } from 'lucide-react';

interface ImageData {
  id: string;
  src: string;
  name: string;
  dateAdded: Date;
  size: number;
  tags: string[];
  people: string[];
  objects: string[];
  location?: string;
}

interface SmartGalleryProps {
  // Props that might be passed from the variant system
}

type SortMode = 'date' | 'name' | 'size';
type ViewMode = 'grid' | 'list';
type FilterMode = 'all' | 'people' | 'objects';

interface SimilarityResult {
  image: ImageData;
  matchedElements: string[];
  matchType: 'people' | 'objects';
  confidence: number;
}

// Mock image data for demonstration
const mockImages: ImageData[] = [
  {
    id: '1',
    src: 'https://picsum.photos/300/200?random=1',
    name: 'IMG_001.jpg',
    dateAdded: new Date('2024-01-15'),
    size: 2048576,
    tags: ['vacation', 'beach'],
    people: ['John', 'Sarah'],
    objects: ['beach', 'sunset', 'ocean'],
    location: 'Miami Beach'
  },
  {
    id: '2',
    src: 'https://picsum.photos/300/200?random=2',
    name: 'IMG_002.jpg',
    dateAdded: new Date('2024-01-14'),
    size: 1536000,
    tags: ['family', 'birthday'],
    people: ['Sarah', 'Mom', 'Dad'],
    objects: ['cake', 'candles', 'party'],
    location: 'Home'
  },
  {
    id: '3',
    src: 'https://picsum.photos/300/200?random=3',
    name: 'IMG_003.jpg',
    dateAdded: new Date('2024-01-13'),
    size: 3072000,
    tags: ['work', 'meeting'],
    people: ['John', 'Alice', 'Bob'],
    objects: ['laptop', 'coffee', 'documents'],
    location: 'Office'
  },
  {
    id: '4',
    src: 'https://picsum.photos/300/200?random=4',
    name: 'IMG_004.jpg',
    dateAdded: new Date('2024-01-12'),
    size: 2560000,
    tags: ['nature', 'hiking'],
    people: ['John'],
    objects: ['mountain', 'trees', 'trail'],
    location: 'Rocky Mountains'
  },
  {
    id: '5',
    src: 'https://picsum.photos/300/200?random=5',
    name: 'IMG_005.jpg',
    dateAdded: new Date('2024-01-11'),
    size: 1800000,
    tags: ['pets', 'cute'],
    people: [],
    objects: ['dog', 'park', 'grass'],
    location: 'Central Park'
  },
  {
    id: '6',
    src: 'https://picsum.photos/300/200?random=6',
    name: 'IMG_006.jpg',
    dateAdded: new Date('2024-01-10'),
    size: 2200000,
    tags: ['food', 'restaurant'],
    people: ['Sarah', 'John'],
    objects: ['pizza', 'wine', 'table'],
    location: 'Italian Restaurant'
  }
];

// Icon mapping for people and objects
const getPersonIcon = (person: string) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    'John': User,
    'Sarah': User,
    'Mom': User,
    'Dad': User,
    'Alice': User,
    'Bob': User
  };
  return iconMap[person] || User;
};

const getObjectIcon = (object: string) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    'beach': Mountain,
    'sunset': Mountain,
    'ocean': Mountain,
    'cake': Pizza,
    'candles': Home,
    'party': Home,
    'laptop': Camera,
    'coffee': Coffee,
    'documents': Camera,
    'mountain': Mountain,
    'trees': Mountain,
    'trail': Mountain,
    'dog': Dog,
    'park': Mountain,
    'grass': Mountain,
    'pizza': Pizza,
    'wine': Coffee,
    'table': Home,
    'car': Car
  };
  return iconMap[object] || Tag;
};

export const SmartGallery: React.FC<SmartGalleryProps> = () => {
  const [images, setImages] = useState<ImageData[]>(mockImages);
  const [filteredImages, setFilteredImages] = useState<ImageData[]>(mockImages);
  const [sortMode, setSortMode] = useState<SortMode>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [showFilterPanel, setShowFilterPanel] = useState<'people' | 'objects' | false>(false);
  const [customNames, setCustomNames] = useState<{[key: string]: string}>({});
  const [editingName, setEditingName] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showSimilaritySearch, setShowSimilaritySearch] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [similarityResults, setSimilarityResults] = useState<SimilarityResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddTag, setShowAddTag] = useState<'people' | 'objects' | 'tags' | null>(null);
  const [newTagInput, setNewTagInput] = useState('');

  // Load custom names from localStorage on mount
  useEffect(() => {
    const savedNames = localStorage.getItem('gallery_custom_names');
    if (savedNames) {
      setCustomNames(JSON.parse(savedNames));
    }
  }, []);

  // Save custom names to localStorage when they change
  useEffect(() => {
    localStorage.setItem('gallery_custom_names', JSON.stringify(customNames));
  }, [customNames]);

  // Sort images based on current sort mode
  useEffect(() => {
    let sorted = [...images];
    
    switch (sortMode) {
      case 'date':
        sorted.sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'size':
        sorted.sort((a, b) => b.size - a.size);
        break;
    }
    
    setFilteredImages(sorted);
  }, [images, sortMode]);

  // Filter images based on filter mode and search
  useEffect(() => {
    let filtered = [...images];

    // Apply filter
    if (filterMode !== 'all' && selectedFilter) {
      filtered = filtered.filter(image => {
        switch (filterMode) {
          case 'people':
            return image.people.includes(selectedFilter);
          case 'objects':
            return image.objects.includes(selectedFilter);
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(image =>
        image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        image.people.some(person => person.toLowerCase().includes(searchTerm.toLowerCase())) ||
        image.objects.some(obj => obj.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    switch (sortMode) {
      case 'date':
        filtered.sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'size':
        filtered.sort((a, b) => b.size - a.size);
        break;
    }

    setFilteredImages(filtered);
  }, [images, filterMode, selectedFilter, searchTerm, sortMode]);

  // Get unique people and objects for filtering
  const getUniquePeople = (): string[] => {
    const people = new Set<string>();
    images.forEach(image => {
      image.people.forEach(person => people.add(person));
    });
    return Array.from(people).sort();
  };

  const getUniqueObjects = (): string[] => {
    const objects = new Set<string>();
    images.forEach(image => {
      image.objects.forEach(obj => objects.add(obj));
    });
    return Array.from(objects).sort();
  };

  const handleFilterSelect = (type: FilterMode, value: string) => {
    if (filterMode === type && selectedFilter === value) {
      // Deselect if clicking the same filter
      setFilterMode('all');
      setSelectedFilter('');
    } else {
      setFilterMode(type);
      setSelectedFilter(value);
    }
    setShowFilterPanel(false);
  };

  // Get display name (custom name or original)
  const getDisplayName = (originalName: string): string => {
    return customNames[originalName] || originalName;
  };

  // Get thumbnail image for a person or object
  const getThumbnailForFilter = (filterType: FilterMode, filterValue: string): string | null => {
    const matchingImage = images.find(image => {
      if (filterType === 'people') {
        return image.people.includes(filterValue);
      } else if (filterType === 'objects') {
        return image.objects.includes(filterValue);
      }
      return false;
    });
    return matchingImage?.src || null;
  };

  // Handle name editing
  const handleNameEdit = (originalName: string, newName: string) => {
    if (newName.trim() && newName !== originalName) {
      setCustomNames(prev => ({
        ...prev,
        [originalName]: newName.trim()
      }));
    }
    setEditingName(null);
  };

  // Handle image click to open modal
  const handleImageClick = (image: ImageData) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  // Handle tag removal from image
  const handleRemoveTag = (imageId: string, tagType: 'people' | 'objects' | 'tags', tagValue: string) => {
    setImages(prev => prev.map(img => {
      if (img.id === imageId) {
        const updatedImage = { ...img };
        if (tagType === 'people') {
          updatedImage.people = img.people.filter(person => person !== tagValue);
        } else if (tagType === 'objects') {
          updatedImage.objects = img.objects.filter(obj => obj !== tagValue);
        } else if (tagType === 'tags') {
          updatedImage.tags = img.tags.filter(tag => tag !== tagValue);
        }
        return updatedImage;
      }
      return img;
    }));

    // Update selected image if it's currently open
    if (selectedImage && selectedImage.id === imageId) {
      setSelectedImage(prev => {
        if (!prev) return null;
        const updatedImage = { ...prev };
        if (tagType === 'people') {
          updatedImage.people = prev.people.filter(person => person !== tagValue);
        } else if (tagType === 'objects') {
          updatedImage.objects = prev.objects.filter(obj => obj !== tagValue);
        } else if (tagType === 'tags') {
          updatedImage.tags = prev.tags.filter(tag => tag !== tagValue);
        }
        return updatedImage;
      });
    }
  };

  // Handle adding new tag to image
  const handleAddTag = (imageId: string, tagType: 'people' | 'objects' | 'tags', tagValue: string) => {
    if (!tagValue.trim()) return;

    setImages(prev => prev.map(img => {
      if (img.id === imageId) {
        const updatedImage = { ...img };
        if (tagType === 'people' && !img.people.includes(tagValue)) {
          updatedImage.people = [...img.people, tagValue];
        } else if (tagType === 'objects' && !img.objects.includes(tagValue)) {
          updatedImage.objects = [...img.objects, tagValue];
        } else if (tagType === 'tags' && !img.tags.includes(tagValue)) {
          updatedImage.tags = [...img.tags, tagValue];
        }
        return updatedImage;
      }
      return img;
    }));

    // Update selected image if it's currently open
    if (selectedImage && selectedImage.id === imageId) {
      setSelectedImage(prev => {
        if (!prev) return null;
        const updatedImage = { ...prev };
        if (tagType === 'people' && !prev.people.includes(tagValue)) {
          updatedImage.people = [...prev.people, tagValue];
        } else if (tagType === 'objects' && !prev.objects.includes(tagValue)) {
          updatedImage.objects = [...prev.objects, tagValue];
        } else if (tagType === 'tags' && !prev.tags.includes(tagValue)) {
          updatedImage.tags = [...prev.tags, tagValue];
        }
        return updatedImage;
      });
    }

    setNewTagInput('');
    setShowAddTag(null);
  };

  // Get all existing tags of a specific type
  const getAllTagsOfType = (tagType: 'people' | 'objects' | 'tags'): string[] => {
    const allTags = new Set<string>();
    images.forEach(image => {
      if (tagType === 'people') {
        image.people.forEach(person => allTags.add(person));
      } else if (tagType === 'objects') {
        image.objects.forEach(obj => allTags.add(obj));
      } else if (tagType === 'tags') {
        image.tags.forEach(tag => allTags.add(tag));
      }
    });
    return Array.from(allTags).sort();
  };

  // Mock AI similarity detection function
  const detectSimilarImages = (uploadedImageSrc: string): SimilarityResult[] => {
    // Simulate AI detection by randomly matching some images
    // In a real implementation, this would use computer vision APIs
    const results: SimilarityResult[] = [];
    
    // Mock detection logic - randomly assign matches for demo
    images.forEach(image => {
      const peopleMatches = image.people.filter(() => Math.random() > 0.7);
      const objectMatches = image.objects.filter(() => Math.random() > 0.6);
      
      if (peopleMatches.length > 0) {
        results.push({
          image,
          matchedElements: peopleMatches,
          matchType: 'people',
          confidence: Math.random() * 0.4 + 0.6 // 60-100%
        });
      }
      
      if (objectMatches.length > 0) {
        results.push({
          image,
          matchedElements: objectMatches,
          matchType: 'objects',
          confidence: Math.random() * 0.3 + 0.5 // 50-80%
        });
      }
    });

    // Sort by confidence
    return results.sort((a, b) => b.confidence - a.confidence);
  };

  // Handle file upload for similarity search
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target?.result as string;
        setUploadedImage(imageSrc);
        setIsSearching(true);
        
        // Simulate processing time
        setTimeout(() => {
          const results = detectSimilarImages(imageSrc);
          setSimilarityResults(results);
          setIsSearching(false);
        }, 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target?.result as string;
        setUploadedImage(imageSrc);
        setIsSearching(true);
        
        setTimeout(() => {
          const results = detectSimilarImages(imageSrc);
          setSimilarityResults(results);
          setIsSearching(false);
        }, 2000);
      };
      reader.readAsDataURL(imageFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Smart Gallery</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {filteredImages.length} of {images.length} images
            </span>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter by People Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterPanel(showFilterPanel ? false : 'people')}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                filterMode === 'people' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Users size={16} />
              <span>People</span>
              {filterMode === 'people' && selectedFilter && (
                <span className="text-xs bg-blue-600 px-2 py-1 rounded">
                  {getDisplayName(selectedFilter)}
                </span>
              )}
            </button>
          </div>

          {/* Filter by Objects Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterPanel(showFilterPanel ? false : 'objects')}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                filterMode === 'objects' 
                  ? 'bg-green-500 text-white border-green-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Tag size={16} />
              <span>Objects</span>
              {filterMode === 'objects' && selectedFilter && (
                <span className="text-xs bg-green-600 px-2 py-1 rounded">
                  {getDisplayName(selectedFilter)}
                </span>
              )}
            </button>
          </div>

          {/* Clear Filter */}
          {filterMode !== 'all' && (
            <button
              onClick={() => {
                setFilterMode('all');
                setSelectedFilter('');
                setShowFilterPanel(false);
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear filter
            </button>
          )}

          {/* Sort */}
          <div className="relative">
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
            </select>
            <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Photo Search */}
          <button
            onClick={() => setShowSimilaritySearch(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <ImageIcon size={16} />
            <span>Photo Search</span>
          </button>

          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilterPanel && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Filter by {showFilterPanel === 'people' ? 'People' : 'Objects'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {showFilterPanel === 'people' ? (
                getUniquePeople().map(person => {
                  const thumbnail = getThumbnailForFilter('people', person);
                  const isSelected = filterMode === 'people' && selectedFilter === person;
                  const displayName = getDisplayName(person);
                  return (
                    <div key={person} className="relative">
                      <button
                        onClick={() => handleFilterSelect('people', person)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors w-full ${
                          isSelected
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {thumbnail ? (
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                            <img
                              src={thumbnail}
                              alt={displayName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <User size={20} className="text-gray-500" />
                          </div>
                        )}
                        {editingName === person ? (
                          <input
                            type="text"
                            defaultValue={displayName}
                            className="text-xs font-medium bg-white text-gray-900 border rounded px-2 py-1 w-full text-center"
                            autoFocus
                            onBlur={(e) => handleNameEdit(person, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleNameEdit(person, e.currentTarget.value);
                              } else if (e.key === 'Escape') {
                                setEditingName(null);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium">{displayName}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingName(person);
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Rename"
                            >
                              <Edit2 size={10} />
                            </button>
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                getUniqueObjects().map(object => {
                  const thumbnail = getThumbnailForFilter('objects', object);
                  const IconComponent = getObjectIcon(object);
                  const isSelected = filterMode === 'objects' && selectedFilter === object;
                  const displayName = getDisplayName(object);
                  return (
                    <div key={object} className="relative">
                      <button
                        onClick={() => handleFilterSelect('objects', object)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors w-full ${
                          isSelected
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {thumbnail ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 relative">
                            <img
                              src={thumbnail}
                              alt={displayName}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                              <IconComponent size={16} className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <IconComponent size={20} className="text-gray-500" />
                          </div>
                        )}
                        {editingName === object ? (
                          <input
                            type="text"
                            defaultValue={displayName}
                            className="text-xs font-medium bg-white text-gray-900 border rounded px-2 py-1 w-full text-center"
                            autoFocus
                            onBlur={(e) => handleNameEdit(object, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleNameEdit(object, e.currentTarget.value);
                              } else if (e.key === 'Escape') {
                                setEditingName(null);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium capitalize">{displayName}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingName(object);
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Rename"
                            >
                              <Edit2 size={10} />
                            </button>
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Search size={48} className="mb-4" />
            <p className="text-lg">No images found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filteredImages.map(image => (
              <div 
                key={image.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleImageClick(image)}
              >
                <div className="aspect-square bg-gray-100">
                  <img
                    src={image.src}
                    alt={image.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-2">
                  <h3 className="font-medium text-xs text-gray-900 truncate">{image.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(image.dateAdded)}</p>
                  {image.people.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Users size={10} className="text-gray-400" />
                      <span className="text-xs text-gray-600 truncate">
                        {image.people.slice(0, 1).join(', ')}
                        {image.people.length > 1 && ` +${image.people.length - 1}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredImages.map(image => (
              <div 
                key={image.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleImageClick(image)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={image.src}
                      alt={image.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{image.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{formatDate(image.dateAdded)}</span>
                      <span>{formatFileSize(image.size)}</span>
                      {image.location && <span>{image.location}</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      {image.people.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {image.people.join(', ')}
                          </span>
                        </div>
                      )}
                      {image.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {image.tags.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">{selectedImage.name}</h2>
              <button
                onClick={() => setShowImageModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row">
              {/* Image */}
              <div className="flex-1 p-4">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.name}
                  className="w-full h-auto max-h-96 object-contain rounded-lg"
                />
              </div>

              {/* Image Details and Tags */}
              <div className="w-full lg:w-80 p-4 border-l border-gray-200">
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Details</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Date: {formatDate(selectedImage.dateAdded)}</p>
                      <p>Size: {formatFileSize(selectedImage.size)}</p>
                      {selectedImage.location && <p>Location: {selectedImage.location}</p>}
                    </div>
                  </div>

                  {/* People Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        <Users size={16} />
                        People
                      </h3>
                      <button
                        onClick={() => setShowAddTag(showAddTag === 'people' ? null : 'people')}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                        title="Add person tag"
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedImage.people.map(person => (
                        <div
                          key={person}
                          className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                        >
                          <span>{getDisplayName(person)}</span>
                          <button
                            onClick={() => handleRemoveTag(selectedImage.id, 'people', person)}
                            className="hover:bg-blue-200 rounded-full p-0.5"
                            title="Remove person tag"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {showAddTag === 'people' && (
                      <div className="mt-3 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter person name or select existing..."
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newTagInput.trim()) {
                                handleAddTag(selectedImage.id, 'people', newTagInput.trim());
                              } else if (e.key === 'Escape') {
                                setShowAddTag(null);
                                setNewTagInput('');
                              }
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => newTagInput.trim() && handleAddTag(selectedImage.id, 'people', newTagInput.trim())}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                            disabled={!newTagInput.trim()}
                          >
                            Add
                          </button>
                        </div>
                        {getAllTagsOfType('people').filter(person => 
                          !selectedImage.people.includes(person) && 
                          person.toLowerCase().includes(newTagInput.toLowerCase())
                        ).length > 0 && (
                          <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                            {getAllTagsOfType('people')
                              .filter(person => 
                                !selectedImage.people.includes(person) && 
                                person.toLowerCase().includes(newTagInput.toLowerCase())
                              )
                              .map(person => (
                                <button
                                  key={person}
                                  onClick={() => handleAddTag(selectedImage.id, 'people', person)}
                                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                                >
                                  {getDisplayName(person)}
                                </button>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Object Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        <Tag size={16} />
                        Objects
                      </h3>
                      <button
                        onClick={() => setShowAddTag(showAddTag === 'objects' ? null : 'objects')}
                        className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm"
                        title="Add object tag"
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedImage.objects.map(object => (
                        <div
                          key={object}
                          className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
                        >
                          <span className="capitalize">{getDisplayName(object)}</span>
                          <button
                            onClick={() => handleRemoveTag(selectedImage.id, 'objects', object)}
                            className="hover:bg-green-200 rounded-full p-0.5"
                            title="Remove object tag"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {showAddTag === 'objects' && (
                      <div className="mt-3 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter object name or select existing..."
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newTagInput.trim()) {
                                handleAddTag(selectedImage.id, 'objects', newTagInput.trim());
                              } else if (e.key === 'Escape') {
                                setShowAddTag(null);
                                setNewTagInput('');
                              }
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => newTagInput.trim() && handleAddTag(selectedImage.id, 'objects', newTagInput.trim())}
                            className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                            disabled={!newTagInput.trim()}
                          >
                            Add
                          </button>
                        </div>
                        {getAllTagsOfType('objects').filter(object => 
                          !selectedImage.objects.includes(object) && 
                          object.toLowerCase().includes(newTagInput.toLowerCase())
                        ).length > 0 && (
                          <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                            {getAllTagsOfType('objects')
                              .filter(object => 
                                !selectedImage.objects.includes(object) && 
                                object.toLowerCase().includes(newTagInput.toLowerCase())
                              )
                              .map(object => (
                                <button
                                  key={object}
                                  onClick={() => handleAddTag(selectedImage.id, 'objects', object)}
                                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                                >
                                  {getDisplayName(object)}
                                </button>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* General Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        <Tag size={16} />
                        Tags
                      </h3>
                      <button
                        onClick={() => setShowAddTag(showAddTag === 'tags' ? null : 'tags')}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-700 text-sm"
                        title="Add tag"
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedImage.tags.map(tag => (
                        <div
                          key={tag}
                          className="flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs"
                        >
                          <span>{tag}</span>
                          <button
                            onClick={() => handleRemoveTag(selectedImage.id, 'tags', tag)}
                            className="hover:bg-gray-200 rounded-full p-0.5"
                            title="Remove tag"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {showAddTag === 'tags' && (
                      <div className="mt-3 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter tag name or select existing..."
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newTagInput.trim()) {
                                handleAddTag(selectedImage.id, 'tags', newTagInput.trim());
                              } else if (e.key === 'Escape') {
                                setShowAddTag(null);
                                setNewTagInput('');
                              }
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => newTagInput.trim() && handleAddTag(selectedImage.id, 'tags', newTagInput.trim())}
                            className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                            disabled={!newTagInput.trim()}
                          >
                            Add
                          </button>
                        </div>
                        {getAllTagsOfType('tags').filter(tag => 
                          !selectedImage.tags.includes(tag) && 
                          tag.toLowerCase().includes(newTagInput.toLowerCase())
                        ).length > 0 && (
                          <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                            {getAllTagsOfType('tags')
                              .filter(tag => 
                                !selectedImage.tags.includes(tag) && 
                                tag.toLowerCase().includes(newTagInput.toLowerCase())
                              )
                              .map(tag => (
                                <button
                                  key={tag}
                                  onClick={() => handleAddTag(selectedImage.id, 'tags', tag)}
                                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                                >
                                  {tag}
                                </button>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Similarity Search Modal */}
      {showSimilaritySearch && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl max-h-full overflow-auto w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Photo Search - Find Similar Images</h2>
              <button
                onClick={() => {
                  setShowSimilaritySearch(false);
                  setUploadedImage(null);
                  setSimilarityResults([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {!uploadedImage ? (
                /* Upload Area */
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload a photo to find similar images</h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop an image here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 cursor-pointer transition-colors"
                  >
                    <Upload size={16} />
                    Choose Photo
                  </label>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Uploaded Image */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={uploadedImage}
                        alt="Uploaded for search"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">Searching for similar images...</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Our AI is analyzing your photo to find similar people, objects, and scenes in your gallery.
                      </p>
                      <button
                        onClick={() => {
                          setUploadedImage(null);
                          setSimilarityResults([]);
                          setIsSearching(false);
                        }}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        Upload different photo
                      </button>
                    </div>
                  </div>

                  {/* Loading State */}
                  {isSearching && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                      <span className="ml-3 text-gray-600">Analyzing image...</span>
                    </div>
                  )}

                  {/* Search Results */}
                  {!isSearching && similarityResults.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">
                        Found {similarityResults.length} similar images
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {similarityResults.map((result, index) => (
                          <div
                            key={`${result.image.id}-${index}`}
                            className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleImageClick(result.image)}
                          >
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                              <img
                                src={result.image.src}
                                alt={result.image.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-gray-900 truncate">
                                {result.image.name}
                              </h4>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {Math.round(result.confidence * 100)}% match
                                </span>
                                <div className="flex items-center gap-1">
                                  {result.matchType === 'people' ? (
                                    <Users size={12} className="text-blue-500" />
                                  ) : (
                                    <Tag size={12} className="text-green-500" />
                                  )}
                                  <span className="text-xs text-gray-600">
                                    {result.matchType}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {result.matchedElements.map(element => (
                                  <span
                                    key={element}
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      result.matchType === 'people'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}
                                  >
                                    {getDisplayName(element)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Results */}
                  {!isSearching && similarityResults.length === 0 && (
                    <div className="text-center py-8">
                      <Search size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No similar images found</h3>
                      <p className="text-gray-600">
                        We couldn't find any images in your gallery that match the people or objects in your uploaded photo.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartGallery;
