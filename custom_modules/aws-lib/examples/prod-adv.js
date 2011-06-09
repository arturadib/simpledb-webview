var aws = require("../lib/aws");

prodAdv = aws.createProdAdvClient(yourAccessKeyId, yourSecretAccessKey, yourAssociateTag);

prodAdv.call("ItemSearch", {SearchIndex: "Books", Keywords: "Javascript"}, function(result) {
  console.log(JSON.stringify(result));
})