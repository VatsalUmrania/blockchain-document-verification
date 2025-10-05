// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DocumentVerification
 * @dev Smart contract for decentralized document verification
 * Allows institutions to issue documents and third parties to verify them
 */
contract DocumentVerification {
    
    // Document structure containing all verification data
    struct Document {
        bytes32 documentHash;        // Hash of the document content
        address issuer;              // Address of the issuing institution
        string issuerName;           // Name of the issuing institution
        string documentType;         // Type of document (degree, certificate, etc.)
        string title;                // Document title ← ADDED THIS
        string recipientName;        // Name of the document recipient
        string recipientId;          // ID of the recipient (student ID, etc.)
        uint256 issuanceDate;        // Timestamp when document was issued
        uint256 expirationDate;      // Timestamp when document expires (0 if no expiration)
        string metadataURI;          // IPFS URI for additional metadata
        bool isActive;               // Whether the document is still valid
        bytes issuerSignature;       // Digital signature from issuer
    }
    
    // Institution structure for verified issuers
    struct Institution {
        string name;
        string registrationNumber;
        string contactInfo;
        bool isVerified;
        uint256 registrationDate;
    }
    
    // Mappings
    mapping(bytes32 => Document) public documents;
    mapping(address => Institution) public institutions;
    mapping(address => bool) public authorizedIssuers;
    mapping(bytes32 => bool) public revokedDocuments;
    
    // Arrays for enumeration
    bytes32[] public documentHashes;
    address[] public institutionAddresses;
    
    // Events
    event DocumentIssued(
        bytes32 indexed documentHash,
        address indexed issuer,
        string recipientName,
        string documentType,
        string title,             // ← ADDED THIS
        uint256 issuanceDate
    );
    
    event DocumentRevoked(
        bytes32 indexed documentHash,
        address indexed issuer,
        uint256 revocationDate
    );
    
    event InstitutionRegistered(
        address indexed institutionAddress,
        string name,
        uint256 registrationDate
    );
    
    event InstitutionVerified(
        address indexed institutionAddress,
        bool verified
    );
    
    // Contract owner
    address public owner;
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can perform this action");
        _;
    }
    
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Only authorized issuers can perform this action");
        _;
    }
    
    modifier documentExists(bytes32 _documentHash) {
        require(documents[_documentHash].issuer != address(0), "Document does not exist");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Register an institution
     */
    function registerInstitution(
        string memory _name,
        string memory _registrationNumber,
        string memory _contactInfo
    ) external {
        require(bytes(_name).length > 0, "Institution name cannot be empty");
        require(institutions[msg.sender].registrationDate == 0, "Institution already registered");
        
        institutions[msg.sender] = Institution({
            name: _name,
            registrationNumber: _registrationNumber,
            contactInfo: _contactInfo,
            isVerified: false,
            registrationDate: block.timestamp
        });
        
        institutionAddresses.push(msg.sender);
        
        emit InstitutionRegistered(msg.sender, _name, block.timestamp);
    }
    
    /**
     * @dev Verify an institution (only owner)
     */
    function verifyInstitution(address _institutionAddress) external onlyOwner {
        require(institutions[_institutionAddress].registrationDate > 0, "Institution not registered");
        
        institutions[_institutionAddress].isVerified = true;
        authorizedIssuers[_institutionAddress] = true;
        
        emit InstitutionVerified(_institutionAddress, true);
    }
    
    /**
     * @dev Issue a new document
     */
    function issueDocument(
        bytes32 _documentHash,
        string memory _documentType,
        string memory _title,              // ← ADDED THIS PARAMETER
        string memory _recipientName,
        string memory _recipientId,
        uint256 _expirationDate,
        string memory _metadataURI,
        bytes memory _issuerSignature
    ) external onlyAuthorizedIssuer {
        require(_documentHash != bytes32(0), "Document hash cannot be empty");
        require(documents[_documentHash].issuer == address(0), "Document already exists");
        require(bytes(_documentType).length > 0, "Document type cannot be empty");
        require(bytes(_recipientName).length > 0, "Recipient name cannot be empty");
        
        documents[_documentHash] = Document({
            documentHash: _documentHash,
            issuer: msg.sender,
            issuerName: institutions[msg.sender].name,
            documentType: _documentType,
            title: _title,                  // ← STORE TITLE
            recipientName: _recipientName,
            recipientId: _recipientId,
            issuanceDate: block.timestamp,
            expirationDate: _expirationDate,
            metadataURI: _metadataURI,
            isActive: true,
            issuerSignature: _issuerSignature
        });
        
        documentHashes.push(_documentHash);
        
        emit DocumentIssued(
            _documentHash,
            msg.sender,
            _recipientName,
            _documentType,
            _title,                        // ← EMIT TITLE
            block.timestamp
        );
    }
    
    /**
     * @dev Verify a document by its hash
     */
    function verifyDocument(bytes32 _documentHash)
        external
        view
        documentExists(_documentHash)
        returns (
            address issuer,
            string memory issuerName,
            string memory documentType,
            string memory title,           // ← ADDED THIS RETURN VALUE
            string memory recipientName,
            string memory recipientId,
            uint256 issuanceDate,
            uint256 expirationDate,
            bool isValidDoc,
            bool isActive
        )
    {
        Document memory doc = documents[_documentHash];

        bool documentIsValid = !revokedDocuments[_documentHash] &&
                              doc.isActive &&
                              (doc.expirationDate == 0 || doc.expirationDate > block.timestamp) &&
                              institutions[doc.issuer].isVerified;

        return (
            doc.issuer,
            doc.issuerName,
            doc.documentType,
            doc.title,                     // ← RETURN TITLE
            doc.recipientName,
            doc.recipientId,
            doc.issuanceDate,
            doc.expirationDate,
            documentIsValid,
            doc.isActive
        );
    }
    
    /**
     * @dev Revoke a document
     */
    function revokeDocument(bytes32 _documentHash) 
        external 
        documentExists(_documentHash) 
    {
        Document storage doc = documents[_documentHash];
        require(doc.issuer == msg.sender, "Only issuer can revoke document");
        require(!revokedDocuments[_documentHash], "Document already revoked");
        
        revokedDocuments[_documentHash] = true;
        doc.isActive = false;
        
        emit DocumentRevoked(_documentHash, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Get document metadata URI
     */
    function getDocumentMetadata(bytes32 _documentHash) 
        external 
        view 
        documentExists(_documentHash)
        returns (string memory) 
    {
        return documents[_documentHash].metadataURI;
    }
    
    /**
     * @dev Get issuer signature for a document
     */
    function getIssuerSignature(bytes32 _documentHash) 
        external 
        view 
        documentExists(_documentHash)
        returns (bytes memory) 
    {
        return documents[_documentHash].issuerSignature;
    }
    
    /**
     * @dev Get total number of documents
     */
    function getTotalDocuments() external view returns (uint256) {
        return documentHashes.length;
    }
    
    /**
     * @dev Get total number of institutions
     */
    function getTotalInstitutions() external view returns (uint256) {
        return institutionAddresses.length;
    }
    
    /**
     * @dev Check if an institution is verified
     */
    function isInstitutionVerified(address _institutionAddress) external view returns (bool) {
        return institutions[_institutionAddress].isVerified;
    }
}
