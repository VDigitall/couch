/**
 * Show function - use multiple `provides()` for media type-based content
 * negotiation.
 * @link http://docs.couchdb.org/en/latest/couchapp/ddocs.html#showfun
 *
 * @param {object} doc - Processed document, may be omitted.
 * @param {object} req - Request Object. http://docs.couchdb.org/en/latest/json-structure.html#request-object
 *
 * @returns {object} Response Object. http://docs.couchdb.org/en/latest/json-structure.html#response-object
 **/

function(doc, req) {
  var ALL = "*";
  var SCHEMA = {
    awards: {
      id: req.query.award_id,
      complaints: {
        id: req.query.complaint_id
      }
    },
    bids: {
      id: req.query.bid_id,
      eligibilityDocuments: {
        id: req.query.eligibility_document
      },
      financialDocuments: {
        id: req.query.financial_document
      },
      qualificationDocuments: {
        id: req.query.qualification_document
      }
    },
    cancellations: {
      id: req.query.cancellation_id
    },
    complaints: {
      id: req.query.complaint_id
    },
    contracts: {
      id: req.query.contract_id
    },
    lots: {
      id: req.query.lot_id
    },
    qualifications: {
      id: req.query.qualification_id,
      complaints:{
        id: req.query.q_complaint_id
      }
    },
    questions:{
        id: req.query.question_id
      }
  };
  var FIELDS_TO_CLEAR = ['_id','_rev', '_revisions', 'doc_type'];

  function getField(schema, obj) {
    var key, arrKey;

    for (key in schema){
      if (ALL == schema[key].id) return obj[key];
      if(schema[key].id) {
        for (arrKey in obj[key]) {
          if (obj[key][arrKey].id === schema[key].id)
            return getField(schema[key], obj[key][arrKey])
        }
        return;
      }
    }
    if (req.query.document_id) {
      if (ALL == req.query.document_id)
        return groupDocuments(obj.documents);
      return getLastDoc(obj.documents, req.query.document_id);
    }

    return obj;
  }

  function formatResponse(data) {
    if (!data)
      return {code:404};

    clearFields(data);

    return {
      body: JSON.stringify({data:data}),
      headers: {"Content-Type": "text/plain; charset=utf-8"}
    };
  }

  function groupDocuments(docs){
    var result = [];
    var unic = {};
    var key;

    docs.forEach(function(item, i) {
      if (!unic[item.id] ||
           Date.parse(docs[unic[item.id]].dateModified) <
           Date.parse(item.dateModified)
         )
         unic[item.id] = i;
    });
    for (key in unic)
      result.push(docs[unic[key]]);

    return result;
  }

  function getLastDoc(docs, id) {
    var allDocs = [],
        length = docs.length;
    var result;

    for(;length--;)
      if (docs[length].id === id) allDocs.push(docs[length]);

    result = allDocs.length ? allDocs[0] : null;
    if (allDocs.length > 1)
      result.previousVersions = allDocs.slice(1);

    return result;
  }


  function clearFields(data) {
    var key;
    for (key in FIELDS_TO_CLEAR)
      data[FIELDS_TO_CLEAR[key]] && delete data[FIELDS_TO_CLEAR[key]];
  }

  return formatResponse( getField(SCHEMA, doc) );
}
