import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Upload, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  Clock,
  Users,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Warehouse,
  MapPin,
  Calendar,
  Settings,
  Bell,
  Mail,
  Phone,
  Truck,
  Box,
  Archive,
  Target,
  Zap,
  Brain,
  X,
  Check,
  Info,
  RefreshCw,
  Star,
  Minus,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Grid,
  Layers,
  Hash
} from 'lucide-react';

// Types
interface Product {
  id: string;
  name: string;
  itemNumber: string;
  category: string;
  quantity: number;
  price: number;
  unit: string;
  minThreshold: number;
  maxThreshold: number;
  storageType: 'pallet' | 'cell' | 'addressable';
  address: string;
  zone: string;
  classification: 'fast-mover' | 'slow-mover' | 'illiquid';
  popularity: number;
  lastMovement: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface InventoryOperation {
  id: string;
  type: 'receipt' | 'issue';
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  date: string;
  performedBy: string;
  reason: string;
  batchNumber?: string;
  expiryDate?: string;
  supplier?: string;
  customer?: string;
  notes?: string;
}

interface StorageLocation {
  id: string;
  address: string;
  zone: string;
  type: 'pallet' | 'cell' | 'addressable';
  capacity: number;
  occupied: number;
  products: string[];
  isActive: boolean;
}

interface SelectionRule {
  strategy: 'FIFO' | 'LIFO';
  productId: string;
  batches: {
    id: string;
    quantity: number;
    date: string;
    expiryDate?: string;
  }[];
}

interface AIAnalytics {
  balanceForecasting: {
    productId: string;
    currentStock: number;
    predictedStock: number;
    recommendedReorder: number;
    confidence: number;
  }[];
  popularityAnalysis: {
    productId: string;
    movementFrequency: number;
    salesVelocity: number;
    classification: 'hot' | 'warm' | 'cold';
  }[];
  placementRecommendations: {
    productId: string;
    currentZone: string;
    recommendedZone: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  warehouseLoadForecast: {
    date: string;
    expectedArrivals: number;
    expectedShipments: number;
    predictedCapacity: number;
  }[];
  anomalies: {
    id: string;
    type: 'sales_spike' | 'writeoff_spike' | 'unusual_movement';
    productId: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    detectedAt: string;
  }[];
}

interface WarehouseMetrics {
  totalProducts: number;
  totalValue: number;
  utilizationRate: number;
  turnoverRate: number;
  averageAge: number;
  fastMovers: number;
  slowMovers: number;
  illiquidItems: number;
}

interface Transaction {
  id: string;
  type: 'receipt' | 'expenditure';
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  invoiceNumber?: string;
  supplier?: string;
  customer?: string;
  date: string;
  performedBy: string;
  notes?: string;
  documentUrl?: string;
}

interface Invoice {
  id: string;
  number: string;
  type: 'purchase' | 'sales';
  supplier?: string;
  customer?: string;
  date: string;
  totalAmount: number;
  status: 'pending' | 'processed' | 'completed';
  uploadedBy: string;
  uploadedAt: string;
  fileName: string;
  items: {
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

interface WarehouseCapacity {
  totalArea: number; // in square meters
  usedArea: number;
  utilizationPercentage: number;
  zones: {
    name: string;
    area: number;
    usedArea: number;
    utilization: number;
  }[];
}

interface AIRecommendation {
  id: string;
  type: 'shortage' | 'excess' | 'reorder' | 'capacity' | 'optimization';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  itemsAffected?: string[];
  suggestedAction: string;
  estimatedImpact: string;
  createdAt: string;
}

// Sample data
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Coffee Beans',
    itemNumber: 'PCB-001',
    category: 'Finished Products',
    quantity: 150,
    price: 25.50,
    unit: 'kg',
    minThreshold: 50,
    maxThreshold: 500,
    storageType: 'pallet',
    address: 'A-01-001',
    zone: 'Zone A',
    classification: 'fast-mover',
    popularity: 85,
    lastMovement: '2024-01-15',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    createdBy: 'System'
  },
  {
    id: '2',
    name: 'Raw Coffee Beans - Arabica',
    itemNumber: 'RCB-ARB-001',
    category: 'Raw Materials',
    quantity: 25,
    price: 12.75,
    unit: 'kg',
    minThreshold: 100,
    maxThreshold: 1000,
    storageType: 'cell',
    address: 'B-02-015',
    zone: 'Zone B',
    classification: 'slow-mover',
    popularity: 45,
    lastMovement: '2024-01-14',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-14',
    createdBy: 'System'
  },
  {
    id: '3',
    name: 'Packaging Boxes',
    itemNumber: 'PKG-BOX-001',
    category: 'Packaging',
    quantity: 2500,
    price: 0.85,
    unit: 'pcs',
    minThreshold: 500,
    maxThreshold: 5000,
    storageType: 'addressable',
    address: 'C-01-A-001',
    zone: 'Zone C',
    classification: 'fast-mover',
    popularity: 92,
    lastMovement: '2024-01-15',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    createdBy: 'System'
  },
  {
    id: '4',
    name: 'Organic Tea Leaves',
    itemNumber: 'OTL-001',
    category: 'Finished Products',
    quantity: 5,
    price: 18.90,
    unit: 'kg',
    minThreshold: 20,
    maxThreshold: 200,
    storageType: 'cell',
    address: 'A-03-008',
    zone: 'Zone A',
    classification: 'illiquid',
    popularity: 12,
    lastMovement: '2023-12-20',
    createdAt: '2023-11-01',
    updatedAt: '2023-12-20',
    createdBy: 'System'
  }
];

const sampleOperations: InventoryOperation[] = [
  {
    id: '1',
    type: 'receipt',
    productId: '1',
    productName: 'Premium Coffee Beans',
    quantity: 100,
    unitPrice: 25.50,
    totalValue: 2550,
    date: '2024-01-15',
    performedBy: 'John Smith',
    reason: 'Stock replenishment',
    batchNumber: 'BATCH-2024-001',
    supplier: 'Coffee Suppliers Ltd',
    notes: 'Monthly stock replenishment from main supplier'
  },
  {
    id: '2',
    type: 'issue',
    productId: '1',
    productName: 'Premium Coffee Beans',
    quantity: 50,
    unitPrice: 25.50,
    totalValue: 1275,
    date: '2024-01-14',
    performedBy: 'Sarah Johnson',
    reason: 'Sales order fulfillment',
    customer: 'Retail Chain ABC',
    notes: 'Bulk order for retail distribution'
  },
  {
    id: '3',
    type: 'receipt',
    productId: '3',
    productName: 'Packaging Boxes',
    quantity: 1000,
    unitPrice: 0.85,
    totalValue: 850,
    date: '2024-01-13',
    performedBy: 'Mike Wilson',
    reason: 'New supplier delivery',
    batchNumber: 'PKG-BATCH-001',
    supplier: 'Packaging Solutions Inc',
    notes: 'First delivery from new packaging supplier'
  }
];

const sampleStorageLocations: StorageLocation[] = [
  {
    id: '1',
    address: 'A-01-001',
    zone: 'Zone A',
    type: 'pallet',
    capacity: 200,
    occupied: 150,
    products: ['1'],
    isActive: true
  },
  {
    id: '2',
    address: 'B-02-015',
    zone: 'Zone B',
    type: 'cell',
    capacity: 50,
    occupied: 25,
    products: ['2'],
    isActive: true
  },
  {
    id: '3',
    address: 'C-01-A-001',
    zone: 'Zone C',
    type: 'addressable',
    capacity: 5000,
    occupied: 2500,
    products: ['3'],
    isActive: true
  }
];

const sampleTransactions: Transaction[] = [
  {
    id: '1',
    type: 'receipt',
    itemId: '1',
    itemName: 'Premium Coffee Beans',
    quantity: 100,
    unitPrice: 25.50,
    totalValue: 2550,
    invoiceNumber: 'INV-2024-001',
    supplier: 'Coffee Suppliers Ltd',
    date: '2024-01-15',
    performedBy: 'John Smith',
    notes: 'Monthly stock replenishment'
  },
  {
    id: '2',
    type: 'expenditure',
    itemId: '1',
    itemName: 'Premium Coffee Beans',
    quantity: 50,
    unitPrice: 25.50,
    totalValue: 1275,
    customer: 'Retail Chain ABC',
    date: '2024-01-14',
    performedBy: 'Sarah Johnson',
    notes: 'Bulk order fulfillment'
  }
];

const sampleCapacity: WarehouseCapacity = {
  totalArea: 10000,
  usedArea: 8000,
  utilizationPercentage: 80,
  zones: [
    { name: 'Zone A - Finished Products', area: 4000, usedArea: 3200, utilization: 80 },
    { name: 'Zone B - Raw Materials', area: 4000, usedArea: 3600, utilization: 90 },
    { name: 'Zone C - Packaging', area: 2000, usedArea: 1200, utilization: 60 }
  ]
};

const WarehouseManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'products' | 'operations' | 'storage' | 'analytics' | 'monitoring' | 'invoices' | 'transactions' | 'capacity'>('dashboard');
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [operations, setOperations] = useState<InventoryOperation[]>(sampleOperations);
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>(sampleStorageLocations);
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTransactions);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [capacity, setCapacity] = useState<WarehouseCapacity>(sampleCapacity);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [aiAnalytics, setAiAnalytics] = useState<AIAnalytics | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOperationModal, setShowOperationModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectionStrategy, setSelectionStrategy] = useState<'FIFO' | 'LIFO'>('FIFO');

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('warehouse_products');
    const savedOperations = localStorage.getItem('warehouse_operations');
    const savedStorageLocations = localStorage.getItem('warehouse_storage_locations');
    const savedTransactions = localStorage.getItem('warehouse_transactions');
    const savedInvoices = localStorage.getItem('warehouse_invoices');
    
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedOperations) setOperations(JSON.parse(savedOperations));
    if (savedStorageLocations) setStorageLocations(JSON.parse(savedStorageLocations));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
    
    // Generate AI analytics and recommendations
    generateAIAnalytics();
    generateAIRecommendations();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('warehouse_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('warehouse_operations', JSON.stringify(operations));
  }, [operations]);

  useEffect(() => {
    localStorage.setItem('warehouse_storage_locations', JSON.stringify(storageLocations));
  }, [storageLocations]);

  useEffect(() => {
    localStorage.setItem('warehouse_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('warehouse_invoices', JSON.stringify(invoices));
  }, [invoices]);

  const generateAIAnalytics = () => {
    // Generate comprehensive AI analytics
    const analytics: AIAnalytics = {
      balanceForecasting: products.map(product => ({
        productId: product.id,
        currentStock: product.quantity,
        predictedStock: Math.max(0, product.quantity - Math.floor(Math.random() * 50) + 20),
        recommendedReorder: product.quantity < product.minThreshold ? product.maxThreshold - product.quantity : 0,
        confidence: Math.floor(Math.random() * 30) + 70
      })),
      popularityAnalysis: products.map(product => ({
        productId: product.id,
        movementFrequency: product.popularity,
        salesVelocity: product.popularity * 0.8,
        classification: product.popularity > 80 ? 'hot' : product.popularity > 40 ? 'warm' : 'cold'
      })),
      placementRecommendations: products
        .filter(product => product.classification === 'fast-mover' && product.zone !== 'Zone A')
        .map(product => ({
          productId: product.id,
          currentZone: product.zone,
          recommendedZone: 'Zone A',
          reason: 'Fast-moving item should be closer to picking area',
          priority: 'high' as const
        })),
      warehouseLoadForecast: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        expectedArrivals: Math.floor(Math.random() * 100) + 50,
        expectedShipments: Math.floor(Math.random() * 80) + 40,
        predictedCapacity: capacity.utilizationPercentage + Math.floor(Math.random() * 10) - 5
      })),
      anomalies: [
        {
          id: '1',
          type: 'sales_spike',
          productId: '1',
          severity: 'medium',
          description: 'Premium Coffee Beans sales increased by 150% in the last week',
          detectedAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'unusual_movement',
          productId: '4',
          severity: 'low',
          description: 'Organic Tea Leaves has not moved for 25+ days',
          detectedAt: new Date().toISOString()
        }
      ]
    };
    
    setAiAnalytics(analytics);
  };

  const generateAIRecommendations = () => {
    const recommendations: AIRecommendation[] = [];
    
    // Check for low stock items
    products.forEach(product => {
      if (product.quantity <= product.minThreshold) {
        recommendations.push({
          id: `shortage-${product.id}`,
          type: 'shortage',
          priority: product.quantity < product.minThreshold * 0.5 ? 'critical' : 'high',
          title: `Low Stock Alert: ${product.name}`,
          description: `Current stock (${product.quantity} ${product.unit}) is below minimum threshold (${product.minThreshold} ${product.unit})`,
          itemsAffected: [product.name],
          suggestedAction: `Reorder ${Math.ceil(product.maxThreshold - product.quantity)} ${product.unit} immediately`,
          estimatedImpact: `Potential stockout risk. Estimated cost: $${((product.maxThreshold - product.quantity) * product.price).toFixed(2)}`,
          createdAt: new Date().toISOString()
        });
      }
    });

    // Check for illiquid items
    products.forEach(product => {
      if (product.classification === 'illiquid') {
        recommendations.push({
          id: `illiquid-${product.id}`,
          type: 'optimization',
          priority: 'medium',
          title: `Illiquid Item: ${product.name}`,
          description: `Item has low movement frequency (${product.popularity}% popularity)`,
          itemsAffected: [product.name],
          suggestedAction: 'Consider promotional pricing or alternative placement',
          estimatedImpact: `Tied up capital: $${(product.quantity * product.price).toFixed(2)}`,
          createdAt: new Date().toISOString()
        });
      }
    });

    // Check warehouse capacity
    if (capacity.utilizationPercentage >= 85) {
      recommendations.push({
        id: 'capacity-warning',
        type: 'capacity',
        priority: capacity.utilizationPercentage >= 95 ? 'critical' : 'high',
        title: 'Warehouse Capacity Alert',
        description: `Warehouse is ${capacity.utilizationPercentage}% full (${capacity.usedArea}/${capacity.totalArea} sq m)`,
        suggestedAction: 'Consider expanding storage or optimizing inventory levels',
        estimatedImpact: 'Risk of storage overflow and operational inefficiency',
        createdAt: new Date().toISOString()
      });
    }

    setAiRecommendations(recommendations);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simulate invoice processing
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      number: `INV-${Date.now()}`,
      type: 'purchase',
      supplier: 'Sample Supplier Ltd',
      date: new Date().toISOString().split('T')[0],
      totalAmount: 1250.00,
      status: 'pending',
      uploadedBy: 'Current User',
      uploadedAt: new Date().toISOString(),
      fileName: file.name,
      items: [
        {
          itemName: 'Sample Item',
          quantity: 50,
          unitPrice: 25.00,
          totalPrice: 1250.00
        }
      ]
    };

    setInvoices(prev => [...prev, newInvoice]);
    setShowUploadModal(false);
    
    // Show success message
    alert('Invoice uploaded successfully! Processing...');
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.itemNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStockStatus = (product: Product) => {
    if (product.quantity <= product.minThreshold) return 'low';
    if (product.quantity >= product.maxThreshold * 0.8) return 'high';
    return 'normal';
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'fast-mover': return 'text-green-600 bg-green-50';
      case 'slow-mover': return 'text-yellow-600 bg-yellow-50';
      case 'illiquid': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleProductOperation = (type: 'receipt' | 'issue', productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newOperation: InventoryOperation = {
      id: Date.now().toString(),
      type,
      productId,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      totalValue: quantity * product.price,
      date: new Date().toISOString().split('T')[0],
      performedBy: 'Current User',
      reason: type === 'receipt' ? 'Stock replenishment' : 'Sales order fulfillment',
      notes: `${type === 'receipt' ? 'Added' : 'Removed'} ${quantity} ${product.unit} via manual operation`
    };

    setOperations(prev => [newOperation, ...prev]);

    // Update product quantity
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { 
            ...p, 
            quantity: type === 'receipt' ? p.quantity + quantity : Math.max(0, p.quantity - quantity),
            lastMovement: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString()
          }
        : p
    ));

    // Regenerate AI analytics
    setTimeout(() => {
      generateAIAnalytics();
      generateAIRecommendations();
    }, 100);
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              <p className="text-xs text-gray-500 mt-1">Active SKUs</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-red-600">
                {products.filter(product => product.quantity <= product.minThreshold).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Need reorder</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fast Movers</p>
              <p className="text-2xl font-bold text-green-600">
                {products.filter(product => product.classification === 'fast-mover').length}
              </p>
              <p className="text-xs text-gray-500 mt-1">High velocity</p>
            </div>
            <Zap className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Warehouse Load</p>
              <p className="text-2xl font-bold text-orange-600">{capacity.utilizationPercentage}%</p>
              <p className="text-xs text-gray-500 mt-1">{capacity.usedArea.toLocaleString()} sq m used</p>
            </div>
            <Warehouse className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-purple-600">
                ${products.reduce((sum, product) => sum + (product.quantity * product.price), 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Inventory worth</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Infographics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Trends */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-blue-600" />
            Price Trends (30 days)
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Premium Coffee Beans</span>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">+8.5%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Raw Coffee Beans</span>
              <div className="flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-600">-3.2%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Packaging Materials</span>
              <div className="flex items-center gap-2">
                <Minus className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">+0.8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Consumption Growth */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Consumption Growth
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="text-sm font-medium text-green-600">+15.3%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Quarter</span>
              <span className="text-sm font-medium text-blue-600">+22.7%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Year to Date</span>
              <span className="text-sm font-medium text-purple-600">+18.9%</span>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-800">
                <strong>Trend:</strong> Steady growth across all product categories with seasonal peaks in Q4.
              </p>
            </div>
          </div>
        </div>

        {/* Warehouse Efficiency */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            Efficiency Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Turnover Rate</span>
              <span className="text-sm font-medium text-blue-600">4.2x/year</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pick Accuracy</span>
              <span className="text-sm font-medium text-green-600">99.7%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Order Fulfillment</span>
              <span className="text-sm font-medium text-purple-600">98.2%</span>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Performance:</strong> Above industry average in all key metrics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Recommendations
          </h3>
          <div className="space-y-4">
            {aiRecommendations.slice(0, 3).map(rec => (
              <div key={rec.id} className={`p-4 rounded-lg border-l-4 ${
                rec.priority === 'critical' ? 'border-red-500 bg-red-50' :
                rec.priority === 'high' ? 'border-orange-500 bg-orange-50' :
                'border-yellow-500 bg-yellow-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    <p className="text-sm font-medium text-gray-800 mt-2">Action: {rec.suggestedAction}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {transactions.slice(0, 5).map(transaction => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {transaction.type === 'receipt' ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{transaction.itemName}</p>
                  <p className="text-sm text-gray-600">
                    {transaction.type === 'receipt' ? 'Received' : 'Shipped'} {transaction.quantity} units
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">${transaction.totalValue.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{transaction.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
            <p className="text-gray-600">Comprehensive inventory and warehouse operations</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload size={16} />
              Upload Invoice
            </button>
            <button
              onClick={() => setShowProductModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={16} />
              Add Product
            </button>
            <button
              onClick={() => setShowOperationModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Activity size={16} />
              New Operation
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'products', label: 'Product Catalog', icon: Package },
            { id: 'operations', label: 'Operations', icon: Activity },
            { id: 'storage', label: 'Storage Management', icon: Grid },
            { id: 'analytics', label: 'AI Analytics', icon: Brain },
            { id: 'monitoring', label: 'Monitoring', icon: Eye },
            { id: 'invoices', label: 'Invoices', icon: Upload }
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-4 border-b-2 font-medium text-sm transition-colors ${
                  currentView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {currentView === 'dashboard' && renderDashboard()}
        
        {currentView === 'products' && (
          <div className="space-y-6">
            {/* Enhanced Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search products by name, item number, or address..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="Finished Products">Finished Products</option>
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Packaging">Packaging</option>
                </select>
                <select
                  value={selectionStrategy}
                  onChange={(e) => setSelectionStrategy(e.target.value as 'FIFO' | 'LIFO')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="FIFO">FIFO Strategy</option>
                  <option value="LIFO">LIFO Strategy</option>
                </select>
              </div>
            </div>

            {/* Enhanced Product Catalog Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Storage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classification</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map(product => {
                      const status = getStockStatus(product);
                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.itemNumber}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.quantity} {product.unit}</div>
                            <div className="text-xs text-gray-500">Min: {product.minThreshold} | Max: {product.maxThreshold}</div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getStockStatusColor(status)}`}>
                              {status === 'low' ? 'Low Stock' : status === 'high' ? 'High Stock' : 'Normal'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.address}</div>
                            <div className="text-xs text-gray-500">{product.zone} • {product.storageType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getClassificationColor(product.classification)}`}>
                              {product.classification.replace('-', ' ')}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">Pop: {product.popularity}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">Total: ${(product.quantity * product.price).toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setEditingProduct(product)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit Product"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleProductOperation('receipt', product.id, 10)}
                                className="text-green-600 hover:text-green-900"
                                title="Add Stock"
                              >
                                <Plus size={16} />
                              </button>
                              <button 
                                onClick={() => handleProductOperation('issue', product.id, 5)}
                                className="text-orange-600 hover:text-orange-900"
                                title="Remove Stock"
                              >
                                <Minus size={16} />
                              </button>
                              <button className="text-red-600 hover:text-red-900" title="Delete Product">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentView === 'operations' && (
          <div className="space-y-6">
            {/* Operations Log */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Inventory Operations Log</h3>
                <div className="flex items-center gap-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>All Operations</option>
                    <option>Receipts Only</option>
                    <option>Issues Only</option>
                  </select>
                  <button
                    onClick={() => setShowOperationModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    New Operation
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {operations.map(operation => (
                  <div key={operation.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      {operation.type === 'receipt' ? (
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{operation.productName}</h4>
                        <p className="text-sm text-gray-600">
                          {operation.type === 'receipt' ? 'Received' : 'Issued'} {operation.quantity} units
                        </p>
                        <p className="text-xs text-gray-500">
                          {operation.reason} • {operation.performedBy} • {operation.date}
                        </p>
                        {operation.batchNumber && (
                          <p className="text-xs text-blue-600">Batch: {operation.batchNumber}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${operation.totalValue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">${operation.unitPrice.toFixed(2)} per unit</p>
                      {operation.supplier && (
                        <p className="text-xs text-gray-500">From: {operation.supplier}</p>
                      )}
                      {operation.customer && (
                        <p className="text-xs text-gray-500">To: {operation.customer}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'storage' && (
          <div className="space-y-6">
            {/* Storage Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  Pallet Storage
                </h3>
                <div className="space-y-3">
                  {storageLocations.filter(loc => loc.type === 'pallet').map(location => (
                    <div key={location.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{location.address}</p>
                        <p className="text-sm text-gray-600">{location.zone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{location.occupied}/{location.capacity}</p>
                        <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(location.occupied / location.capacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Grid className="w-5 h-5 text-green-600" />
                  Cell Storage
                </h3>
                <div className="space-y-3">
                  {storageLocations.filter(loc => loc.type === 'cell').map(location => (
                    <div key={location.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{location.address}</p>
                        <p className="text-sm text-gray-600">{location.zone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{location.occupied}/{location.capacity}</p>
                        <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(location.occupied / location.capacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-purple-600" />
                  Addressable Storage
                </h3>
                <div className="space-y-3">
                  {storageLocations.filter(loc => loc.type === 'addressable').map(location => (
                    <div key={location.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{location.address}</p>
                        <p className="text-sm text-gray-600">{location.zone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{location.occupied}/{location.capacity}</p>
                        <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${(location.occupied / location.capacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Address-based Product Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                Address-based Product Search
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search by Address</label>
                  <input
                    type="text"
                    placeholder="Enter storage address (e.g., A-01-001)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Zone</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>All Zones</option>
                    <option>Zone A</option>
                    <option>Zone B</option>
                    <option>Zone C</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'transactions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
              <div className="space-y-4">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      {transaction.type === 'receipt' ? (
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{transaction.itemName}</h4>
                        <p className="text-sm text-gray-600">
                          {transaction.type === 'receipt' ? 'Received from' : 'Shipped to'} {transaction.supplier || transaction.customer}
                        </p>
                        <p className="text-xs text-gray-500">
                          Performed by {transaction.performedBy} on {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{transaction.quantity} units</p>
                      <p className="text-sm text-gray-600">${transaction.totalValue.toLocaleString()}</p>
                      {transaction.invoiceNumber && (
                        <p className="text-xs text-gray-500">Invoice: {transaction.invoiceNumber}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'invoices' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Management</h3>
              {invoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No invoices uploaded yet</p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Upload First Invoice
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map(invoice => (
                    <div key={invoice.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">Invoice #{invoice.number}</h4>
                          <p className="text-sm text-gray-600">
                            {invoice.type === 'purchase' ? 'From' : 'To'} {invoice.supplier || invoice.customer}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          invoice.status === 'completed' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'processed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Date</p>
                          <p className="font-medium">{invoice.date}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Amount</p>
                          <p className="font-medium">${invoice.totalAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Uploaded By</p>
                          <p className="font-medium">{invoice.uploadedBy}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">File</p>
                          <p className="font-medium text-blue-600 cursor-pointer hover:underline">{invoice.fileName}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'capacity' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Warehouse Capacity Overview</h3>
              
              {/* Overall Capacity */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Total Warehouse Utilization</h4>
                  <span className="text-2xl font-bold text-gray-900">{capacity.utilizationPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full transition-all duration-300 ${
                      capacity.utilizationPercentage >= 90 ? 'bg-red-500' :
                      capacity.utilizationPercentage >= 75 ? 'bg-orange-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${capacity.utilizationPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>{capacity.usedArea.toLocaleString()} sq m used</span>
                  <span>{capacity.totalArea.toLocaleString()} sq m total</span>
                </div>
              </div>

              {/* Zone Breakdown */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Zone Utilization</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  {capacity.zones.map((zone, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3">{zone.name}</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Utilization</span>
                          <span className="font-medium">{zone.utilization}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              zone.utilization >= 90 ? 'bg-red-500' :
                              zone.utilization >= 75 ? 'bg-orange-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${zone.utilization}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-600">
                          {zone.usedArea.toLocaleString()} / {zone.area.toLocaleString()} sq m
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Capacity Recommendations */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Capacity Recommendations
                </h5>
                <div className="space-y-2 text-sm text-blue-800">
                  {capacity.utilizationPercentage >= 85 && (
                    <p>• Warehouse is approaching full capacity. Consider expanding or optimizing storage.</p>
                  )}
                  {capacity.zones.some(zone => zone.utilization >= 90) && (
                    <p>• Some zones are critically full. Redistribute inventory or expand high-utilization zones.</p>
                  )}
                  <p>• Optimize vertical space utilization with taller shelving systems.</p>
                  <p>• Implement automated storage and retrieval systems for better space efficiency.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="space-y-6">
            {/* AI Analytics Dashboard */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI-Powered Analytics & Insights
              </h3>

              {/* Balance Forecasting */}
              {aiAnalytics && (
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      Balance Forecasting
                    </h5>
                    <div className="space-y-3">
                      {aiAnalytics.balanceForecasting.slice(0, 4).map(forecast => {
                        const product = products.find(p => p.id === forecast.productId);
                        return (
                          <div key={forecast.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{product?.name}</p>
                              <p className="text-sm text-gray-600">
                                Current: {forecast.currentStock} → Predicted: {forecast.predictedStock}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-blue-600">{forecast.confidence}% confidence</p>
                              {forecast.recommendedReorder > 0 && (
                                <p className="text-xs text-orange-600">Reorder: {forecast.recommendedReorder}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-600" />
                      Popularity Analysis
                    </h5>
                    <div className="space-y-3">
                      {aiAnalytics.popularityAnalysis.slice(0, 4).map(analysis => {
                        const product = products.find(p => p.id === analysis.productId);
                        return (
                          <div key={analysis.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{product?.name}</p>
                              <p className="text-sm text-gray-600">
                                Movement: {analysis.movementFrequency}% • Velocity: {analysis.salesVelocity.toFixed(1)}%
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              analysis.classification === 'hot' ? 'bg-red-100 text-red-800' :
                              analysis.classification === 'warm' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {analysis.classification.toUpperCase()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Placement Recommendations */}
              {aiAnalytics && aiAnalytics.placementRecommendations.length > 0 && (
                <div className="mb-8">
                  <h5 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    Placement Recommendations
                  </h5>
                  <div className="space-y-3">
                    {aiAnalytics.placementRecommendations.map(rec => {
                      const product = products.find(p => p.id === rec.productId);
                      return (
                        <div key={rec.productId} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-medium text-gray-900">{product?.name}</h6>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {rec.priority.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Move from <strong>{rec.currentZone}</strong> to <strong>{rec.recommendedZone}</strong>
                          </p>
                          <p className="text-sm text-gray-700">{rec.reason}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Warehouse Load Forecast */}
              {aiAnalytics && (
                <div className="mb-8">
                  <h5 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    7-Day Warehouse Load Forecast
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                    {aiAnalytics.warehouseLoadForecast.map((forecast, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg text-center">
                        <p className="text-xs text-gray-500 mb-1">
                          {new Date(forecast.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-sm font-medium text-gray-900">{forecast.predictedCapacity}%</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-green-600">↑ {forecast.expectedArrivals}</p>
                          <p className="text-xs text-red-600">↓ {forecast.expectedShipments}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Anomaly Detection */}
              {aiAnalytics && aiAnalytics.anomalies.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    Anomaly Detection
                  </h5>
                  <div className="space-y-3">
                    {aiAnalytics.anomalies.map(anomaly => {
                      const product = products.find(p => p.id === anomaly.productId);
                      return (
                        <div key={anomaly.id} className={`p-4 rounded-lg border-l-4 ${
                          anomaly.severity === 'high' ? 'border-red-500 bg-red-50' :
                          anomaly.severity === 'medium' ? 'border-orange-500 bg-orange-50' :
                          'border-yellow-500 bg-yellow-50'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-medium text-gray-900">{product?.name}</h6>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              anomaly.severity === 'high' ? 'bg-red-100 text-red-800' :
                              anomaly.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {anomaly.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{anomaly.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Detected: {new Date(anomaly.detectedAt).toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'monitoring' && (
          <div className="space-y-6">
            {/* Real-time Monitoring Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Operations */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Live Operations
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">Active Receipts</p>
                      <p className="text-sm text-green-700">3 operations in progress</p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">Pending Issues</p>
                      <p className="text-sm text-blue-700">7 orders awaiting fulfillment</p>
                    </div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Staff on Duty</p>
                      <p className="text-sm text-gray-700">12 warehouse personnel</p>
                    </div>
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Space Utilization */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Warehouse className="w-5 h-5 text-orange-600" />
                  Space Utilization
                </h3>
                <div className="space-y-4">
                  {capacity.zones.map((zone, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{zone.name}</span>
                        <span className="text-sm text-gray-600">{zone.utilization}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            zone.utilization >= 90 ? 'bg-red-500' :
                            zone.utilization >= 75 ? 'bg-orange-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${zone.utilization}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {zone.usedArea.toLocaleString()} / {zone.area.toLocaleString()} sq m
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Performance KPIs
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Order Accuracy</span>
                    <span className="text-sm font-medium text-green-600">99.7%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pick Rate</span>
                    <span className="text-sm font-medium text-blue-600">145 items/hour</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cycle Time</span>
                    <span className="text-sm font-medium text-purple-600">2.3 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Inventory Turns</span>
                    <span className="text-sm font-medium text-orange-600">4.2x/year</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cost per Order</span>
                    <span className="text-sm font-medium text-red-600">$3.45</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert System */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                System Alerts & Notifications
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div className="flex-1">
                    <p className="font-medium text-red-900">Critical Stock Level</p>
                    <p className="text-sm text-red-700">Raw Coffee Beans - Arabica is below critical threshold</p>
                  </div>
                  <span className="text-xs text-red-600">2 min ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="font-medium text-yellow-900">Scheduled Maintenance</p>
                    <p className="text-sm text-yellow-700">Conveyor system maintenance scheduled for tomorrow 2 AM</p>
                  </div>
                  <span className="text-xs text-yellow-600">1 hour ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900">Incoming Shipment</p>
                    <p className="text-sm text-blue-700">Large delivery expected at 3 PM - prepare Zone B</p>
                  </div>
                  <span className="text-xs text-blue-600">3 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Invoice/Bill</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Document Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Purchase Invoice</option>
                  <option>Sales Invoice</option>
                  <option>Delivery Receipt</option>
                  <option>Bill of Materials</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, JPG, PNG</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Upload & Process
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseManagement;
