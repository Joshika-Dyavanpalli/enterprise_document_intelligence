import re


def chunk_text(text, chunk_size=500, overlap=100):
    """
    Split document text into chunks while preserving page information.

    Expected page markers from app.py:
        --- Page 1 ---
        --- Page 2 ---
    """

    chunks = []

    # Find page sections
    page_pattern = r"--- Page (\d+) ---"

    matches = list(re.finditer(page_pattern, text))

    # --------------------------------------------------
    # If page markers exist
    # --------------------------------------------------

    if matches:

        for i, match in enumerate(matches):

            page_number = int(match.group(1))

            start = match.end()

            if i + 1 < len(matches):
                end = matches[i + 1].start()
            else:
                end = len(text)

            page_text = text[start:end].strip()

            if not page_text:
                continue

            # Create chunks within this page only
            page_start = 0

            while page_start < len(page_text):

                page_end = page_start + chunk_size

                chunk_content = page_text[page_start:page_end].strip()

                if chunk_content:

                    chunk = (
                        f"[Page {page_number}]\n"
                        f"{chunk_content}"
                    )

                    chunks.append(chunk)

                # Prevent infinite loop
                if page_end >= len(page_text):
                    break

                page_start += chunk_size - overlap

        return chunks

    # --------------------------------------------------
    # Fallback
    # --------------------------------------------------
    # Used for documents where page information
    # is not available.

    start = 0

    while start < len(text):

        end = start + chunk_size

        chunk_content = text[start:end].strip()

        if chunk_content:
            chunks.append(
                "[Page information unavailable]\n"
                + chunk_content
            )

        if end >= len(text):
            break

        start += chunk_size - overlap

    return chunks