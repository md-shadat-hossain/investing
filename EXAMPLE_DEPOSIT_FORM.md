# Example Deposit Form Component

This is a sample React component for the user-facing deposit form. You can adapt this to your frontend framework.

## React Component (with Tailwind CSS)

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DepositForm = () => {
  const [gateways, setGateways] = useState([]);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    txHash: '',
    walletAddress: '',
  });
  const [proofImage, setProofImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch active gateways on mount
  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/gateways/active?purpose=deposit');
      setGateways(response.data.data);
    } catch (err) {
      setError('Failed to load payment gateways');
    }
  };

  // Handle gateway selection
  const handleGatewayChange = (e) => {
    const gateway = gateways.find(g => g._id === e.target.value);
    setSelectedGateway(gateway);
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPG, PNG, HEIC, or HEIF)');
        return;
      }

      // Validate file size (20MB max)
      if (file.size > 20 * 1024 * 1024) {
        setError('File size must be less than 20MB');
        return;
      }

      setProofImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!selectedGateway) {
      setError('Please select a payment gateway');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(formData.amount) < selectedGateway.minDeposit) {
      setError(`Minimum deposit amount is $${selectedGateway.minDeposit}`);
      return;
    }

    if (parseFloat(formData.amount) > selectedGateway.maxDeposit) {
      setError(`Maximum deposit amount is $${selectedGateway.maxDeposit}`);
      return;
    }

    if (!formData.txHash) {
      setError('Please enter your transaction ID');
      return;
    }

    if (!proofImage) {
      setError('Please upload a payment proof screenshot');
      return;
    }

    // Prepare form data
    const submitData = new FormData();
    submitData.append('amount', formData.amount);
    submitData.append('paymentGatewayId', selectedGateway._id);
    submitData.append('txHash', formData.txHash);
    submitData.append('proofImage', proofImage);

    if (formData.walletAddress && selectedGateway.type === 'crypto') {
      submitData.append('walletAddress', formData.walletAddress);
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('userToken'); // Get from your auth context
      const response = await axios.post(
        'http://localhost:3000/api/v1/transactions/deposit',
        submitData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSuccess('Deposit request submitted successfully! Please wait for admin approval.');

      // Reset form
      setFormData({ amount: '', txHash: '', walletAddress: '' });
      setProofImage(null);
      setImagePreview(null);
      setSelectedGateway(null);

      // Optionally redirect after 3 seconds
      setTimeout(() => {
        // window.location.href = '/transactions';
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit deposit request');
    } finally {
      setLoading(false);
    }
  };

  // Calculate fee and net amount
  const calculateFee = () => {
    if (!selectedGateway || !formData.amount) return 0;
    const amount = parseFloat(formData.amount);
    if (selectedGateway.depositFeeType === 'percentage') {
      return (amount * selectedGateway.depositFee) / 100;
    }
    return selectedGateway.depositFee;
  };

  const netAmount = formData.amount ? parseFloat(formData.amount) - calculateFee() : 0;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Recharge Wallet</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Gateway Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Gateway <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedGateway?._id || ''}
            onChange={handleGatewayChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select a payment method</option>
            {gateways.map((gateway) => (
              <option key={gateway._id} value={gateway._id}>
                {gateway.name} ({gateway.currency})
              </option>
            ))}
          </select>
        </div>

        {/* Gateway Details Display */}
        {selectedGateway && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Payment Details</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>Gateway:</strong> {selectedGateway.name}</p>
              <p><strong>Type:</strong> {selectedGateway.type}</p>
              {selectedGateway.walletAddress && (
                <div>
                  <strong>Wallet Address:</strong>
                  <div className="mt-1 p-2 bg-white rounded border border-blue-200 font-mono text-xs break-all">
                    {selectedGateway.walletAddress}
                  </div>
                </div>
              )}
              <p><strong>Limits:</strong> ${selectedGateway.minDeposit} - ${selectedGateway.maxDeposit}</p>
              <p><strong>Fee:</strong> {selectedGateway.depositFee}{selectedGateway.depositFeeType === 'percentage' ? '%' : ' USD'}</p>
              {selectedGateway.instructions && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <strong>Instructions:</strong>
                  <p className="mt-1 text-blue-700">{selectedGateway.instructions}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deposit Amount (USD) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter amount"
            required
          />
          {selectedGateway && formData.amount && (
            <div className="mt-2 text-sm space-y-1">
              <p className="text-gray-600">Fee: ${calculateFee().toFixed(2)}</p>
              <p className="text-gray-900 font-semibold">You will receive: ${netAmount.toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Transaction ID Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Transaction ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.txHash}
            onChange={(e) => setFormData({ ...formData, txHash: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter the transaction ID from your payment"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter the transaction ID or reference number from your payment confirmation.
          </p>
        </div>

        {/* Wallet Address (for crypto only) */}
        {selectedGateway?.type === 'crypto' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Wallet Address (Optional)
            </label>
            <input
              type="text"
              value={formData.walletAddress}
              onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your wallet address"
            />
          </div>
        )}

        {/* Proof Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Proof Screenshot <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            {imagePreview ? (
              <div className="space-y-3">
                <img
                  src={imagePreview}
                  alt="Proof preview"
                  className="max-h-64 mx-auto rounded-lg shadow-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setProofImage(null);
                    setImagePreview(null);
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <label className="mt-2 block">
                  <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                    Click to upload
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"
                    onChange={handleImageChange}
                    className="hidden"
                    required
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG, HEIC up to 20MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Deposit Request'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Your deposit will be reviewed by our admin team and credited to your wallet within 24 hours.
        </p>
      </form>
    </div>
  );
};

export default DepositForm;
```

## Usage

1. **Install dependencies** (if not already installed):
   ```bash
   npm install axios
   ```

2. **Import and use the component**:
   ```jsx
   import DepositForm from './components/DepositForm';

   function DepositPage() {
     return (
       <div>
         <DepositForm />
       </div>
     );
   }
   ```

3. **Update API base URL**:
   Replace `http://localhost:3000/api/v1` with your actual backend URL.

4. **Handle authentication**:
   Make sure you're getting the user token from your auth context/store:
   ```javascript
   const token = localStorage.getItem('userToken'); // or from Context/Redux
   ```

## Features Included

✅ **Gateway Selection** - Dropdown with all active gateways
✅ **Gateway Details Display** - Shows wallet address, limits, fees
✅ **Amount Input** - With validation for min/max limits
✅ **Fee Calculator** - Shows fee and net amount in real-time
✅ **Transaction ID Input** - For user's payment reference
✅ **Image Upload** - With preview and validation
✅ **Error Handling** - Displays validation and API errors
✅ **Success Message** - Confirms submission
✅ **Loading State** - Disables form during submission
✅ **Responsive Design** - Works on all screen sizes

## Customization

You can customize the styling by:
- Changing Tailwind CSS classes
- Adding your own color scheme
- Modifying the layout structure
- Adding animations (e.g., Framer Motion)

## Next.js Version

If you're using Next.js, wrap the component with dynamic import to avoid SSR issues:

```jsx
// pages/deposit.js
import dynamic from 'next/dynamic';

const DepositForm = dynamic(() => import('../components/DepositForm'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function DepositPage() {
  return <DepositForm />;
}
```
