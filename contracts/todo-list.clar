;; Define a map to store todos
(define-map todos uint {text: (string-utf8 256), completed: bool})

;; Define a variable to keep track of the next todo ID
(define-data-var next-id uint u0)

;; Function to add a new todo
(define-public (add-todo (text (string-utf8 256)))
  (let ((id (var-get next-id)))
    (map-set todos id {text: text, completed: false})
    (var-set next-id (+ id u1))
    (ok id)))

;; Function to mark a todo as completed
(define-public (complete-todo (id uint))
  (match (map-get? todos id)
    todo (begin
      (map-set todos id (merge todo {completed: true}))
      (ok true))
    (err u0)))

;; Function to get a todo by ID
(define-read-only (get-todo (id uint))
  (map-get? todos id))

;; Function to get all todos
(define-read-only (get-all-todos (start uint) (end uint))
  (map unwrap-panic
    (map get-todo
      (range start (min end (var-get next-id))))))