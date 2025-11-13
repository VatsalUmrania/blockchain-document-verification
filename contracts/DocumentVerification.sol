// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DocumentVerification
 * @dev Smart contract for decentralized document verification
 */
contract DocumentVerification {
    
    // Document structure
    struct Document {
        bytes32 documentHash;
        address issuer;
        string issuerName;
        string documentType;
        string title;
        string recipientName;
        string recipientId;
        uint256 issuanceDate;
        uint256 expirationDate;
        string metadataURI;
        bool isActive;
        bytes issuerSignature;
        // --- MODIFICATION: Added new state flag ---
        bool isVerified; // true if confirmVerification has been called
    }
    
    // Institution structure
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
    
    // Arrays
    bytes32[] public documentHashes;
    address[] public institutionAddresses;
    
    // Events
    event DocumentIssued(
        bytes32 indexed documentHash,
        address indexed issuer,
        string recipientName,
        string documentType,
        string title,
        uint256 issuanceDate
    );
    
    event DocumentVerified(
        bytes32 indexed documentHash,
        address indexed verifier,
        uint256 verificationDate
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
    
    event InstitutionUpdated(
        address indexed institutionAddress,
        string name
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
    
    // ... (registerInstitution, updateInstitution, verifyInstitution functions remain the same) ...
    
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

    function updateInstitution(
        string memory _name,
        string memory _registrationNumber,
        string memory _contactInfo
    ) external {
        require(institutions[msg.sender].registrationDate > 0, "Institution not registered");
        require(bytes(_name).length > 0, "Institution name cannot be empty");
        
        institutions[msg.sender].name = _name;
        institutions[msg.sender].registrationNumber = _registrationNumber;
        institutions[msg.sender].contactInfo = _contactInfo;
        
        emit InstitutionUpdated(msg.sender, _name);
    }
    
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
        string memory _title,
        string memory _recipientName,
        string memory _recipientId,
        uint256 _expirationDate,
        string memory _metadataURI,
        bytes memory _issuerSignature
    ) external onlyAuthorizedIssuer {
        require(_documentHash != bytes32(0), "Document hash cannot be empty");
        require(documents[_documentHash].issuer == address(0), "Document already exists");
        
        documents[_documentHash] = Document({
            documentHash: _documentHash,
            issuer: msg.sender,
            issuerName: institutions[msg.sender].name,
            documentType: _documentType,
            title: _title,
            recipientName: _recipientName,
            recipientId: _recipientId,
            issuanceDate: block.timestamp,
            expirationDate: _expirationDate,
            metadataURI: _metadataURI,
            isActive: true,
            issuerSignature: _issuerSignature,
            isVerified: false // Default to false
        });
        documentHashes.push(_documentHash);
        
        emit DocumentIssued(
            _documentHash,
            msg.sender,
            _recipientName,
            _documentType,
            _title,
            block.timestamp
        );
    }
    
    // --- MODIFICATION: Fixed "Stack too deep" error ---
    /**
     * @dev Read-only check for a document's details and validity
     * @param _documentHash Hash of the document to verify
     * @return doc The complete Document struct
     * @return isValidDoc Calculated boolean for overall validity
     */
    function verifyDocument(bytes32 _documentHash)
        external
        view
        documentExists(_documentHash)
        returns (
            Document memory doc,
            bool isValidDoc
        )
    {
        doc = documents[_documentHash];
        
        // Calculate overall validity
        isValidDoc = doc.isActive &&
                     !revokedDocuments[_documentHash] &&
                     (doc.expirationDate == 0 || doc.expirationDate > block.timestamp) &&
                     institutions[doc.issuer].isVerified &&
                     doc.isVerified; // Check our new flag

        // Return the struct and the calculated boolean
        return (doc, isValidDoc);
    }

    /**
     * @dev Publicly confirms a document's hash has been verified.
     */
    function confirmVerification(bytes32 _documentHash) 
        external 
        documentExists(_documentHash) 
    {
        Document storage doc = documents[_documentHash];

        require(doc.isActive, "Document has been revoked by the issuer");
        require(!revokedDocuments[_documentHash], "Document has been revoked");
        require(doc.expirationDate == 0 || doc.expirationDate > block.timestamp, "Document has expired");
        require(!doc.isVerified, "Document has already been verified");
        require(institutions[doc.issuer].isVerified, "Issuer is not verified");

        doc.isVerified = true;

        emit DocumentVerified(_documentHash, msg.sender, block.timestamp);
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
    
    // ... (getDocumentMetadata, getIssuerSignature, etc. remain the same) ...
    
    function getDocumentMetadata(bytes32 _documentHash) 
        external 
        view 
        documentExists(_documentHash)
        returns (string memory) 
    {
        return documents[_documentHash].metadataURI;
    }
    
    function getIssuerSignature(bytes32 _documentHash) 
        external 
        view 
        documentExists(_documentHash)
        returns (bytes memory) 
    {
        return documents[_documentHash].issuerSignature;
    }
    
    function getTotalDocuments() external view returns (uint256) {
        return documentHashes.length;
    }
    
    function getTotalInstitutions() external view returns (uint256) {
        return institutionAddresses.length;
    }
    
    function isInstitutionVerified(address _institutionAddress) external view returns (bool) {
        return institutions[_institutionAddress].isVerified;
    }
}