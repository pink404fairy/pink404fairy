
#!/bin/bash

for doc in ../incoming-docs/*.docx; do
    filename=$(basename -- "$doc" .docx)
    pandoc "$doc" -f docx -t markdown -o "../_posts/$(date +%Y-%m-%d)-${filename// /-}.md"
done