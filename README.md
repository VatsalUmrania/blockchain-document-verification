# Decentralized Document Verification System

A blockchain-based document verification system that allows institutions to issue documents and third parties to verify them without relying on centralized servers.

## 🌟 Features

### For Institutions (Document Issuers)
- **Institution Registration**: Register on the blockchain as a verified issuer
- **Document Issuance**: Issue documents with comprehensive metadata
- **QR Code Generation**: Generate QR codes for easy verification
- **Blockchain Storage**: Store document hashes and metadata on-chain
- **Digital Signatures**: Cryptographically sign documents for authenticity

### For Third Parties (Verifiers)
- **Decentralized Verification**: Verify documents directly from blockchain
- **File Upload Verification**: Upload document files for hash-based verification
- **Hash-based Verification**: Verify using document hash directly
- **QR Code Scanning**: Scan QR codes for instant verification
- **Complete Document Information**: Access all document metadata and issuer details

### Key Benefits
- ✅ **No Centralized Dependencies**: Verification works without issuer's servers
- ✅ **Tamper-Proof**: Documents stored on immutable blockchain
- ✅ **Global Accessibility**: Verify from anywhere in the world
- ✅ **Real-time Verification**: Instant verification results
- ✅ **Complete Transparency**: All verification data publicly accessible

## 🏗️ Architecture

### Smart Contract Layer
- **DocumentVerification.sol**: Main contract for document management
- **Institution Management**: Register and verify institutions
- **Document Lifecycle**: Issue, verify, and revoke documents
- **Access Control**: Role-based permissions for different operations

### Frontend Application
- **React + Vite**: Modern web application framework
- **Web3 Integration**: MetaMask wallet connection
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live blockchain interaction

### Verification Workflow
1. **Institution Registration**: Institutions register on blockchain
2. **Document Issuance**: Documents issued with metadata and QR codes
3. **Third-party Verification**: Anyone can verify documents independently
4. **Blockchain Confirmation**: All data verified directly from blockchain

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd blockchain-document-verification
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Set up environment variables**
```bash
# Create .env file in root directory
cp .env.example .env

# Add your configuration
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
SEPOLIA_RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_private_key_for_deployment
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Smart Contract Deployment

1. **Compile contracts**
```bash
npm run compile
```

2. **Deploy to local network**
```bash
# Start local Hardhat node
npm run node

# Deploy to local network (in another terminal)
npm run deploy:local
```

3. **Deploy to testnet (Sepolia)**
```bash
npm run deploy:sepolia
```

4. **Verify on Etherscan**
```bash
npm run verify:sepolia <contract_address>
```

### Running the Application

1. **Start the development server**
```bash
npm run dev
```

2. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📋 Usage Guide

### For Institutions

#### 1. Register Institution
1. Connect your MetaMask wallet
2. Navigate to "Issue Documents"
3. Fill in institution details:
   - Institution name
   - Registration number
   - Contact information
   - Address
4. Submit registration transaction
5. Wait for blockchain confirmation

#### 2. Issue Documents
1. Upload document file (PDF, DOC, DOCX, Images)
2. Fill in document metadata:
   - Document type (degree, certificate, etc.)
   - Recipient information
   - Issuance and expiration dates
   - Academic details (for degrees)
3. Submit issuance transaction
4. Generate and save QR code
5. Embed QR code in the document

### For Third Parties (Verification)

#### Method 1: File Upload Verification
1. Navigate to "Verify Documents"
2. Select "Upload Document" method
3. Upload the document file
4. Click "Verify Document"
5. View verification results

#### Method 2: Hash-based Verification
1. Navigate to "Verify Documents"
2. Select "Enter Hash" method
3. Enter the document hash
4. Click "Verify Document"
5. View verification results

#### Method 3: QR Code Scanning
1. Navigate to "QR Scanner"
2. Allow camera permissions
3. Point camera at QR code
4. View automatic verification results

## 🔧 Configuration

### Environment Variables

```bash
# Blockchain Configuration
REACT_APP_CONTRACT_ADDRESS=0x...          # Deployed contract address
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/...  # RPC endpoint
PRIVATE_KEY=0x...                         # Private key for deployment

# API Keys
ETHERSCAN_API_KEY=...                     # For contract verification
POLYGONSCAN_API_KEY=...                   # For Polygon verification

# Database (Optional - for caching)
MONGODB_URI=mongodb://localhost:27017/docverify
```

### Supported Networks
- **Local Development**: Hardhat Network (Chain ID: 31337)
- **Ethereum Sepolia**: Testnet (Chain ID: 11155111)
- **Polygon Mumbai**: Testnet (Chain ID: 80001)
- **Ethereum Mainnet**: Production (Chain ID: 1)
- **Polygon Mainnet**: Production (Chain ID: 137)

## 🔐 Security Features

### Smart Contract Security
- **Access Control**: Role-based permissions
- **Input Validation**: Comprehensive parameter validation
- **Reentrancy Protection**: Safe external calls
- **Overflow Protection**: SafeMath operations

### Frontend Security
- **Wallet Integration**: Secure MetaMask connection
- **Input Sanitization**: XSS protection
- **HTTPS Enforcement**: Secure communication
- **Error Handling**: Graceful error management

## 🧪 Testing

### Smart Contract Tests
```bash
# Run contract tests
npm test

# Run with coverage
npm run coverage
```

### Frontend Tests
```bash
# Run frontend tests
cd frontend && npm test
```

## 📚 API Reference

### Smart Contract Functions

#### Institution Management
```solidity
function registerInstitution(string name, string regNumber, string contact)
function verifyInstitution(address institutionAddress)
function isInstitutionVerified(address institutionAddress) returns (bool)
```

#### Document Management
```solidity
function issueDocument(bytes32 hash, string docType, string recipient, ...)
function verifyDocument(bytes32 hash) returns (...)
function revokeDocument(bytes32 hash)
```

### REST API Endpoints

```bash
# Health check
GET /api/health

# Document operations
POST /api/documents
GET /api/documents/user/:walletAddress
GET /api/documents/status/:hash/:address
PUT /api/documents/:hash/verify
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review existing issues and discussions

## 🔮 Future Enhancements

- **IPFS Integration**: Decentralized document storage
- **Multi-signature Support**: Enhanced security for institutions
- **Mobile App**: Native mobile applications
- **Batch Operations**: Bulk document issuance
- **Advanced Analytics**: Verification statistics and insights
- **Integration APIs**: Third-party system integration
