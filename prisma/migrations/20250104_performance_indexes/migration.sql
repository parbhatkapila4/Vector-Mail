CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_embedding_vector 
ON "Email" USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);


CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_thread_sent 
ON "Email"(threadId, sentAt DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_account_label 
ON "Email"(threadId, emailLabel);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thread_account_status 
ON "Thread"(accountId, inboxStatus, lastMessageDate DESC) 
WHERE inboxStatus = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thread_account_sent 
ON "Thread"(accountId, sentStatus, lastMessageDate DESC) 
WHERE sentStatus = true;


CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_address_lookup 
ON "EmailAddress"(address, accountId);


CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_email 
ON "User"(emailAddress);


CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attachment_email 
ON "EmailAttachment"(emailId, name);


CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_has_attachments 
ON "Email"(hasAttachments, threadId) 
WHERE hasAttachments = true;


CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chatbot_user_day 
ON "ChatbotInteraction"(userId, day DESC);


ANALYZE "User";
ANALYZE "Account";
ANALYZE "Thread";
ANALYZE "Email";
ANALYZE "EmailAddress";
ANALYZE "EmailAttachment";

