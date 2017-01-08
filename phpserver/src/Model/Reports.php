<?php

namespace App\Model;

class Reports extends Model
{
    /**
     * Get all books.
     *
     * @return object
     */
    public function fetchAll($data)
    {
       return $this->dbQuery("SELECT * FROM KPI_REPORTS");
    }

    /**
     * Get book specified by id.
     *
     * @return object
     */
    public function fetchById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM books WHERE id = ? LIMIT 1");
        $stmt->execute(array( $id ));

        return $stmt->fetch(\PDO::FETCH_OBJ);
    }
}
