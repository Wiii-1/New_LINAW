// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;


contract AuditTrail {

    struct AuditRecord {
        bytes32 auditId;
        bytes32 hashValue;
        string eventType;
        uint256 anchoredAt;
    }


    mapping(bytes32 => AuditRecord) private auditRecords;


    event AuditAnchored(
        bytes32 indexed auditId,
        bytes32 indexed hashValue,
        string eventType,
        uint256 anchoredAt
    );


    function anchorAudit(
        bytes32 _auditId,
        bytes32 _hashValue,
        string calldata _eventType
    )
        external
    {

        require(
            auditRecords[_auditId].anchoredAt == 0,
            "Audit already anchored"
        );


        auditRecords[_auditId] = AuditRecord({
            auditId: _auditId,
            hashValue: _hashValue,
            eventType: _eventType,
            anchoredAt: block.timestamp
        });


        emit AuditAnchored(
            _auditId,
            _hashValue,
            _eventType,
            block.timestamp
        );
    }


    function verifyAudit(
        bytes32 _auditId,
        bytes32 _hashValue
    ) external view returns (bool) {
        AuditRecord memory record = auditRecords[_auditId];

        return record.anchoredAt != 0
            && record.hashValue == _hashValue;
    }


    function getAudit(
        bytes32 _auditId
    )
        external
        view
        returns(
            bytes32,
            bytes32,
            string memory,
            uint256
        )
    {

        AuditRecord memory record =
            auditRecords[_auditId];


        return (
            record.auditId,
            record.hashValue,
            record.eventType,
            record.anchoredAt
        );
    }
}